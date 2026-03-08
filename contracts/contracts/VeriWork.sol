// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/// @title VeriWork
/// @notice A decentralized task marketplace on Avalanche for organizations and workers
contract VeriWork is ReentrancyGuard, Ownable {
    // Enums
    enum TaskStatus {
        Open,
        Claimed,
        Submitted,
        Completed,
        Cancelled
    }

    enum TaskCategory {
        Design,
        Code,
        Translation,
        Data
    }

    // Structs
    struct Task {
        uint256 id;
        address org;
        address worker;
        string title;
        string description;
        TaskCategory category;
        uint256 reward;
        uint256 deadline;
        uint256 postedAt;
        TaskStatus status;
        string submissionURI;
        uint256 pocReward;
    }

    struct WorkerProfile {
        uint256 pocScore;
        uint256 tasksCompleted;
        uint256 totalEarned;
        uint256 networkSize;
        uint256 endorsements;
        uint256[] completedTaskIds;
    }

    // State Variables
    mapping(uint256 => Task) public tasks;
    mapping(address => WorkerProfile) public workerProfiles;
    mapping(address => uint256) public orgEscrowBalance;
    mapping(address => mapping(address => bool)) public hasEndorsed;
    uint256 public taskCount;
    uint256 public constant POC_PER_TASK = 10;
    IERC20 public immutable usdc;

    // Events
    event TaskPosted(uint256 indexed taskId, address indexed org, uint256 reward);
    event TaskClaimed(uint256 indexed taskId, address indexed worker);
    event TaskSubmitted(
        uint256 indexed taskId,
        address indexed worker,
        string uri
    );
    event SubmissionApproved(
        uint256 indexed taskId,
        address indexed worker,
        uint256 reward,
        uint256 pocGain
    );
    event SubmissionRejected(uint256 indexed taskId, address indexed worker);
    event WorkerEndorsed(address indexed worker, address indexed endorser);
    event OrgDeposited(address indexed org, uint256 amount);

    /// @notice Initialize contract with USDC token address
    /// @param _usdc Address of USDC token on the network
    constructor(address _usdc) Ownable(msg.sender) {
        require(_usdc != address(0), "Invalid USDC address");
        usdc = IERC20(_usdc);
    }

    /// @notice Deposit USDC to org's escrow balance
    /// @param amount Amount of USDC to deposit (6 decimals)
    function depositRewards(uint256 amount) external {
        require(amount > 0, "Amount must be greater than 0");
        require(
            usdc.transferFrom(msg.sender, address(this), amount),
            "USDC transfer failed"
        );
        orgEscrowBalance[msg.sender] += amount;
        emit OrgDeposited(msg.sender, amount);
    }

    /// @notice Post a new task for workers to complete
    /// @param title Task title
    /// @param description Task description
    /// @param category Task category (Design, Code, Translation, Data)
    /// @param reward Reward amount in USDC (6 decimals)
    /// @param deadlineHours Hours until task deadline
    function postTask(
        string memory title,
        string memory description,
        TaskCategory category,
        uint256 reward,
        uint256 deadlineHours
    ) external {
        require(reward > 0, "Reward must be greater than 0");
        require(deadlineHours > 0, "Deadline must be in the future");
        require(
            orgEscrowBalance[msg.sender] >= reward,
            "Insufficient escrow balance"
        );
        require(bytes(title).length > 0, "Title cannot be empty");
        require(bytes(description).length > 0, "Description cannot be empty");

        uint256 taskId = taskCount++;
        uint256 deadline = block.timestamp + deadlineHours * 1 hours;
        uint256 pocReward = POC_PER_TASK + (reward / 10e6);
        if (pocReward > 50) {
            pocReward = 50;
        }

        orgEscrowBalance[msg.sender] -= reward;

        tasks[taskId] = Task({
            id: taskId,
            org: msg.sender,
            worker: address(0),
            title: title,
            description: description,
            category: category,
            reward: reward,
            deadline: deadline,
            postedAt: block.timestamp,
            status: TaskStatus.Open,
            submissionURI: "",
            pocReward: pocReward
        });

        emit TaskPosted(taskId, msg.sender, reward);
    }

    /// @notice Claim a task to work on it
    /// @param taskId ID of the task to claim
    function claimTask(uint256 taskId) external {
        Task storage task = tasks[taskId];
        require(task.status == TaskStatus.Open, "Task is not open");
        require(task.org != msg.sender, "Org cannot claim own task");

        task.worker = msg.sender;
        task.status = TaskStatus.Claimed;

        emit TaskClaimed(taskId, msg.sender);
    }

    /// @notice Submit work for a claimed task
    /// @param taskId ID of the task being submitted
    /// @param submissionURI IPFS hash or URL of submission
    function submitTask(uint256 taskId, string memory submissionURI)
        external
    {
        Task storage task = tasks[taskId];
        require(task.worker == msg.sender, "Only worker can submit");
        require(task.status == TaskStatus.Claimed, "Task is not claimed");
        require(
            bytes(submissionURI).length > 0,
            "Submission URI cannot be empty"
        );

        task.submissionURI = submissionURI;
        task.status = TaskStatus.Submitted;

        emit TaskSubmitted(taskId, msg.sender, submissionURI);
    }

    /// @notice Approve a submitted task and pay the worker
    /// @param taskId ID of the task to approve
    function approveSubmission(uint256 taskId) external nonReentrant {
        Task storage task = tasks[taskId];
        require(task.org == msg.sender, "Only org can approve");
        require(task.status == TaskStatus.Submitted, "Task is not submitted");
        require(task.worker != address(0), "No worker assigned");

        address worker = task.worker;
        uint256 reward = task.reward;
        uint256 pocGain = task.pocReward;

        require(
            usdc.transfer(worker, reward),
            "USDC transfer to worker failed"
        );

        WorkerProfile storage profile = workerProfiles[worker];
        profile.pocScore += pocGain;
        profile.tasksCompleted += 1;
        profile.totalEarned += reward;
        profile.completedTaskIds.push(taskId);

        task.status = TaskStatus.Completed;

        emit SubmissionApproved(taskId, worker, reward, pocGain);
    }

    /// @notice Reject a submitted task and return it to Open status
    /// @param taskId ID of the task to reject
    function rejectSubmission(uint256 taskId) external {
        Task storage task = tasks[taskId];
        require(task.org == msg.sender, "Only org can reject");
        require(task.status == TaskStatus.Submitted, "Task is not submitted");
        require(task.worker != address(0), "No worker assigned");

        address worker = task.worker;
        address org = task.org;
        uint256 reward = task.reward;

        orgEscrowBalance[org] += reward;
        task.worker = address(0);
        task.submissionURI = "";
        task.status = TaskStatus.Open;

        emit SubmissionRejected(taskId, worker);
    }

    /// @notice Endorse a worker and give them POC points
    /// @param worker Address of worker to endorse
    function endorseWorker(address worker) external {
        require(worker != msg.sender, "Cannot endorse yourself");
        require(
            !hasEndorsed[msg.sender][worker],
            "Already endorsed this worker"
        );

        hasEndorsed[msg.sender][worker] = true;

        WorkerProfile storage profile = workerProfiles[worker];
        profile.endorsements += 1;
        profile.pocScore += 5;

        emit WorkerEndorsed(worker, msg.sender);
    }

    /// @notice Withdraw unused USDC from org escrow
    /// @param amount Amount to withdraw (6 decimals)
    function withdrawEscrow(uint256 amount) external nonReentrant {
        require(amount > 0, "Amount must be greater than 0");
        require(
            orgEscrowBalance[msg.sender] >= amount,
            "Insufficient escrow balance"
        );

        orgEscrowBalance[msg.sender] -= amount;
        require(
            usdc.transfer(msg.sender, amount),
            "USDC transfer failed"
        );
    }

    // View Functions

    /// @notice Get POC score of a worker
    /// @param worker Address of worker
    /// @return POC score of the worker
    function getPocScore(address worker) external view returns (uint256) {
        return workerProfiles[worker].pocScore;
    }

    /// @notice Get number of completed tasks for a worker
    /// @param worker Address of worker
    /// @return Number of completed tasks
    function getTasksCompleted(address worker)
        external
        view
        returns (uint256)
    {
        return workerProfiles[worker].tasksCompleted;
    }

    /// @notice Get total USDC earned by a worker
    /// @param worker Address of worker
    /// @return Total USDC earned
    function getTotalEarned(address worker) external view returns (uint256) {
        return workerProfiles[worker].totalEarned;
    }

    /// @notice Get network size of a worker
    /// @param worker Address of worker
    /// @return Network size
    function getNetworkSize(address worker) external view returns (uint256) {
        return workerProfiles[worker].networkSize;
    }

    /// @notice Get number of endorsements for a worker
    /// @param worker Address of worker
    /// @return Number of endorsements
    function getEndorsements(address worker) external view returns (uint256) {
        return workerProfiles[worker].endorsements;
    }

    /// @notice Get complete worker profile
    /// @param worker Address of worker
    /// @return WorkerProfile struct
    function getWorkerProfile(address worker)
        external
        view
        returns (WorkerProfile memory)
    {
        return workerProfiles[worker];
    }

    /// @notice Get array of completed task IDs for a worker
    /// @param worker Address of worker
    /// @return Array of completed task IDs
    function getCompletedTaskIds(address worker)
        external
        view
        returns (uint256[] memory)
    {
        return workerProfiles[worker].completedTaskIds;
    }

    /// @notice Get task details by ID
    /// @param taskId ID of the task
    /// @return Task struct
    function getTask(uint256 taskId) external view returns (Task memory) {
        return tasks[taskId];
    }

    /// @notice Get org's escrow balance
    /// @param org Address of organization
    /// @return Escrow balance in USDC
    function getEscrowBalance(address org) external view returns (uint256) {
        return orgEscrowBalance[org];
    }

    /// @notice Get all open tasks
    /// @return Array of open tasks
    function getOpenTasks() external view returns (Task[] memory) {
        uint256 count = 0;
        for (uint256 i = 0; i < taskCount; i++) {
            if (tasks[i].status == TaskStatus.Open) {
                count++;
            }
        }

        Task[] memory openTasks = new Task[](count);
        uint256 index = 0;
        for (uint256 i = 0; i < taskCount; i++) {
            if (tasks[i].status == TaskStatus.Open) {
                openTasks[index] = tasks[i];
                index++;
            }
        }

        return openTasks;
    }

    /// @notice Get all tasks posted by an organization
    /// @param org Address of organization
    /// @return Array of tasks posted by org
    function getOrgTasks(address org)
        external
        view
        returns (Task[] memory)
    {
        uint256 count = 0;
        for (uint256 i = 0; i < taskCount; i++) {
            if (tasks[i].org == org) {
                count++;
            }
        }

        Task[] memory orgTasks = new Task[](count);
        uint256 index = 0;
        for (uint256 i = 0; i < taskCount; i++) {
            if (tasks[i].org == org) {
                orgTasks[index] = tasks[i];
                index++;
            }
        }

        return orgTasks;
    }

    /// @notice Get active tasks for a worker (Claimed or Submitted status)
    /// @param worker Address of worker
    /// @return Array of active tasks for worker
    function getWorkerActiveTasks(address worker)
        external
        view
        returns (Task[] memory)
    {
        uint256 count = 0;
        for (uint256 i = 0; i < taskCount; i++) {
            if (
                tasks[i].worker == worker &&
                (tasks[i].status == TaskStatus.Claimed ||
                    tasks[i].status == TaskStatus.Submitted)
            ) {
                count++;
            }
        }

        Task[] memory activeTasks = new Task[](count);
        uint256 index = 0;
        for (uint256 i = 0; i < taskCount; i++) {
            if (
                tasks[i].worker == worker &&
                (tasks[i].status == TaskStatus.Claimed ||
                    tasks[i].status == TaskStatus.Submitted)
            ) {
                activeTasks[index] = tasks[i];
                index++;
            }
        }

        return activeTasks;
    }
}
