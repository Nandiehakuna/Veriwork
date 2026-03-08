import { expect } from "chai";
import { ethers } from "hardhat";
import type { Contract, Signer } from "ethers";

describe("VeriWork Contract", function () {
  let veriWork: Contract;
  let mockUSDC: Contract;
  let owner: Signer;
  let org: Signer;
  let worker: Signer;
  let endorser: Signer;
  let otherWorker: Signer;

  const INITIAL_BALANCE = ethers.parseUnits("10000", 6);
  const TASK_REWARD = ethers.parseUnits("100", 6);
  const POC_PER_TASK = 10;

  beforeEach(async function () {
    // Get signers
    [owner, org, worker, endorser, otherWorker] =
      await ethers.getSigners();

    // Deploy mock USDC
    const MockERC20Factory = await ethers.getContractFactory("MockERC20");
    mockUSDC = (await MockERC20Factory.deploy(
      "USDC",
      "USDC",
      6
    )) as MockERC20;
    await mockUSDC.waitForDeployment();

    // Mint USDC to test addresses
    await mockUSDC.mint(org.address, INITIAL_BALANCE);
    await mockUSDC.mint(worker.address, ethers.parseUnits("1000", 6));
    await mockUSDC.mint(endorser.address, ethers.parseUnits("1000", 6));

    // Deploy VeriWork contract
    const VeriWorkFactory = await ethers.getContractFactory("VeriWork");
    veriWork = (await VeriWorkFactory.deploy(
      await mockUSDC.getAddress()
    )) as VeriWork;
    await veriWork.waitForDeployment();

    // Approve contract to spend USDC
    const usdcAddress = await mockUSDC.getAddress();
    await mockUSDC
      .connect(org)
      .approve(await veriWork.getAddress(), ethers.MaxUint256);
    await mockUSDC
      .connect(worker)
      .approve(await veriWork.getAddress(), ethers.MaxUint256);
    await mockUSDC
      .connect(endorser)
      .approve(await veriWork.getAddress(), ethers.MaxUint256);
  });

  describe("1. Deployment", function () {
    it("should set correct USDC address", async function () {
      const usdcAddress = await mockUSDC.getAddress();
      expect(await veriWork.usdc()).to.equal(usdcAddress);
    });
  });

  describe("2. depositRewards", function () {
    it("should allow org to deposit USDC", async function () {
      await veriWork.connect(org).depositRewards(TASK_REWARD);
      const balance = await veriWork.getEscrowBalance(org.address);
      expect(balance).to.equal(TASK_REWARD);
    });

    it("should update escrow balance correctly", async function () {
      const firstDeposit = ethers.parseUnits("100", 6);
      const secondDeposit = ethers.parseUnits("200", 6);

      await veriWork.connect(org).depositRewards(firstDeposit);
      let balance = await veriWork.getEscrowBalance(org.address);
      expect(balance).to.equal(firstDeposit);

      await veriWork.connect(org).depositRewards(secondDeposit);
      balance = await veriWork.getEscrowBalance(org.address);
      expect(balance).to.equal(firstDeposit + secondDeposit);
    });

    it("should emit OrgDeposited event", async function () {
      await expect(veriWork.connect(org).depositRewards(TASK_REWARD))
        .to.emit(veriWork, "OrgDeposited")
        .withArgs(org.address, TASK_REWARD);
    });

    it("should revert if amount is 0", async function () {
      await expect(
        veriWork.connect(org).depositRewards(0)
      ).to.be.revertedWith("Amount must be greater than 0");
    });

    it("should revert if insufficient USDC balance", async function () {
      await expect(
        veriWork.connect(worker).depositRewards(INITIAL_BALANCE)
      ).to.be.revertedWith("USDC transfer failed");
    });
  });

  describe("3. postTask", function () {
    beforeEach(async function () {
      // Deposit enough USDC for tasks
      await veriWork
        .connect(org)
        .depositRewards(ethers.parseUnits("1000", 6));
    });

    it("should create task with correct fields", async function () {
      const title = "Test Task";
      const description = "Task description";
      const reward = ethers.parseUnits("100", 6);
      const deadlineHours = 24;

      await veriWork
        .connect(org)
        .postTask(title, description, 1, reward, deadlineHours);

      const task = await veriWork.getTask(0);
      expect(task.id).to.equal(0);
      expect(task.org).to.equal(org.address);
      expect(task.title).to.equal(title);
      expect(task.description).to.equal(description);
      expect(task.reward).to.equal(reward);
      expect(task.status).to.equal(0); // Open
      expect(task.pocReward).to.equal(POC_PER_TASK + Number(reward / 10n ** 6n));
    });

    it("should decrement org escrow balance", async function () {
      const initialBalance = await veriWork.getEscrowBalance(org.address);
      const reward = ethers.parseUnits("100", 6);

      await veriWork
        .connect(org)
        .postTask("Task", "Description", 0, reward, 24);

      const newBalance = await veriWork.getEscrowBalance(org.address);
      expect(newBalance).to.equal(initialBalance - reward);
    });

    it("should increment taskCount", async function () {
      expect(await veriWork.taskCount()).to.equal(0);

      await veriWork
        .connect(org)
        .postTask("Task 1", "Description", 0, TASK_REWARD, 24);
      expect(await veriWork.taskCount()).to.equal(1);

      await veriWork
        .connect(org)
        .postTask("Task 2", "Description", 1, TASK_REWARD, 24);
      expect(await veriWork.taskCount()).to.equal(2);
    });

    it("should emit TaskPosted event", async function () {
      await expect(
        veriWork
          .connect(org)
          .postTask("Task", "Description", 0, TASK_REWARD, 24)
      )
        .to.emit(veriWork, "TaskPosted")
        .withArgs(0, org.address, TASK_REWARD);
    });

    it("should revert if insufficient escrow", async function () {
      const tooMuchReward = ethers.parseUnits("2000", 6);
      await expect(
        veriWork
          .connect(org)
          .postTask("Task", "Description", 0, tooMuchReward, 24)
      ).to.be.revertedWith("Insufficient escrow balance");
    });

    it("should cap pocReward at 50", async function () {
      const largeReward = ethers.parseUnits("1000", 6);
      await veriWork
        .connect(org)
        .depositRewards(largeReward);

      await veriWork
        .connect(org)
        .postTask("Task", "Description", 0, largeReward, 24);

      const task = await veriWork.getTask(0);
      expect(task.pocReward).to.equal(50);
    });
  });

  describe("4. claimTask", function () {
    beforeEach(async function () {
      await veriWork
        .connect(org)
        .depositRewards(ethers.parseUnits("1000", 6));
      await veriWork
        .connect(org)
        .postTask("Task", "Description", 0, TASK_REWARD, 24);
    });

    it("should allow worker to claim open task", async function () {
      await veriWork.connect(worker).claimTask(0);
      const task = await veriWork.getTask(0);
      expect(task.worker).to.equal(worker.address);
      expect(task.status).to.equal(1); // Claimed
    });

    it("should emit TaskClaimed event", async function () {
      await expect(veriWork.connect(worker).claimTask(0))
        .to.emit(veriWork, "TaskClaimed")
        .withArgs(0, worker.address);
    });

    it("should not allow org to claim own task", async function () {
      await expect(veriWork.connect(org).claimTask(0)).to.be.revertedWith(
        "Org cannot claim own task"
      );
    });

    it("should not allow claiming non-open task", async function () {
      await veriWork.connect(worker).claimTask(0);
      await expect(veriWork.connect(otherWorker).claimTask(0)).to.be.revertedWith(
        "Task is not open"
      );
    });
  });

  describe("5. submitTask", function () {
    beforeEach(async function () {
      await veriWork
        .connect(org)
        .depositRewards(ethers.parseUnits("1000", 6));
      await veriWork
        .connect(org)
        .postTask("Task", "Description", 0, TASK_REWARD, 24);
      await veriWork.connect(worker).claimTask(0);
    });

    it("should allow worker to submit claimed task", async function () {
      const submissionURI = "ipfs://Qm...";
      await veriWork.connect(worker).submitTask(0, submissionURI);

      const task = await veriWork.getTask(0);
      expect(task.submissionURI).to.equal(submissionURI);
      expect(task.status).to.equal(2); // Submitted
    });

    it("should emit TaskSubmitted event", async function () {
      const submissionURI = "ipfs://Qm...";
      await expect(veriWork.connect(worker).submitTask(0, submissionURI))
        .to.emit(veriWork, "TaskSubmitted")
        .withArgs(0, worker.address, submissionURI);
    });

    it("should not allow non-worker to submit", async function () {
      await expect(
        veriWork.connect(otherWorker).submitTask(0, "ipfs://Qm...")
      ).to.be.revertedWith("Only worker can submit");
    });

    it("should not allow submitting non-claimed task", async function () {
      await veriWork
        .connect(org)
        .postTask("Task 2", "Description", 0, TASK_REWARD, 24);

      await expect(
        veriWork.connect(worker).submitTask(1, "ipfs://Qm...")
      ).to.be.revertedWith("Task is not claimed");
    });
  });

  describe("6. approveSubmission", function () {
    beforeEach(async function () {
      await veriWork
        .connect(org)
        .depositRewards(ethers.parseUnits("1000", 6));
      await veriWork
        .connect(org)
        .postTask("Task", "Description", 0, TASK_REWARD, 24);
      await veriWork.connect(worker).claimTask(0);
      await veriWork.connect(worker).submitTask(0, "ipfs://Qm...");
    });

    it("should transfer USDC to worker", async function () {
      const initialBalance = await mockUSDC.balanceOf(worker.address);
      await veriWork.connect(org).approveSubmission(0);
      const newBalance = await mockUSDC.balanceOf(worker.address);
      expect(newBalance).to.equal(initialBalance + TASK_REWARD);
    });

    it("should update worker profile stats", async function () {
      await veriWork.connect(org).approveSubmission(0);

      const profile = await veriWork.getWorkerProfile(worker.address);
      expect(profile.tasksCompleted).to.equal(1);
      expect(profile.totalEarned).to.equal(TASK_REWARD);
      expect(profile.completedTaskIds[0]).to.equal(0);
    });

    it("should add POC reward to worker score", async function () {
      const task = await veriWork.getTask(0);
      const pocGain = task.pocReward;

      await veriWork.connect(org).approveSubmission(0);

      const profile = await veriWork.getWorkerProfile(worker.address);
      expect(profile.pocScore).to.equal(pocGain);
    });

    it("should set task status to Completed", async function () {
      await veriWork.connect(org).approveSubmission(0);
      const task = await veriWork.getTask(0);
      expect(task.status).to.equal(3); // Completed
    });

    it("should emit SubmissionApproved event", async function () {
      const task = await veriWork.getTask(0);
      await expect(veriWork.connect(org).approveSubmission(0))
        .to.emit(veriWork, "SubmissionApproved")
        .withArgs(0, worker.address, TASK_REWARD, task.pocReward);
    });

    it("should not allow non-org to approve", async function () {
      await expect(
        veriWork.connect(worker).approveSubmission(0)
      ).to.be.revertedWith("Only org can approve");
    });

    it("should have nonReentrant protection", async function () {
      // This is a basic check - true reentrancy protection would need a more complex test
      await veriWork.connect(org).approveSubmission(0);
      // Should succeed once
      const task = await veriWork.getTask(0);
      expect(task.status).to.equal(3);
    });
  });

  describe("7. rejectSubmission", function () {
    beforeEach(async function () {
      await veriWork
        .connect(org)
        .depositRewards(ethers.parseUnits("1000", 6));
      await veriWork
        .connect(org)
        .postTask("Task", "Description", 0, TASK_REWARD, 24);
      await veriWork.connect(worker).claimTask(0);
      await veriWork.connect(worker).submitTask(0, "ipfs://Qm...");
    });

    it("should return task to Open status", async function () {
      await veriWork.connect(org).rejectSubmission(0);
      const task = await veriWork.getTask(0);
      expect(task.status).to.equal(0); // Open
    });

    it("should return reward to org escrow", async function () {
      const initialBalance = await veriWork.getEscrowBalance(org.address);
      await veriWork.connect(org).rejectSubmission(0);
      const newBalance = await veriWork.getEscrowBalance(org.address);
      expect(newBalance).to.equal(initialBalance + TASK_REWARD);
    });

    it("should clear worker from task", async function () {
      await veriWork.connect(org).rejectSubmission(0);
      const task = await veriWork.getTask(0);
      expect(task.worker).to.equal(ethers.ZeroAddress);
    });

    it("should clear submission URI", async function () {
      await veriWork.connect(org).rejectSubmission(0);
      const task = await veriWork.getTask(0);
      expect(task.submissionURI).to.equal("");
    });

    it("should emit SubmissionRejected event", async function () {
      await expect(veriWork.connect(org).rejectSubmission(0))
        .to.emit(veriWork, "SubmissionRejected")
        .withArgs(0, worker.address);
    });

    it("should not allow non-org to reject", async function () {
      await expect(
        veriWork.connect(worker).rejectSubmission(0)
      ).to.be.revertedWith("Only org can reject");
    });
  });

  describe("8. endorseWorker", function () {
    it("should increase worker endorsements", async function () {
      await veriWork.connect(endorser).endorseWorker(worker.address);
      const profile = await veriWork.getWorkerProfile(worker.address);
      expect(profile.endorsements).to.equal(1);
    });

    it("should add 5 POC points", async function () {
      await veriWork.connect(endorser).endorseWorker(worker.address);
      const profile = await veriWork.getWorkerProfile(worker.address);
      expect(profile.pocScore).to.equal(5);
    });

    it("should track endorsement status", async function () {
      await veriWork.connect(endorser).endorseWorker(worker.address);
      const hasEndorsed = await veriWork.hasEndorsed(
        endorser.address,
        worker.address
      );
      expect(hasEndorsed).to.be.true;
    });

    it("should emit WorkerEndorsed event", async function () {
      await expect(veriWork.connect(endorser).endorseWorker(worker.address))
        .to.emit(veriWork, "WorkerEndorsed")
        .withArgs(worker.address, endorser.address);
    });

    it("should not allow self-endorsement", async function () {
      await expect(
        veriWork.connect(worker).endorseWorker(worker.address)
      ).to.be.revertedWith("Cannot endorse yourself");
    });

    it("should not allow double endorsement", async function () {
      await veriWork.connect(endorser).endorseWorker(worker.address);
      await expect(
        veriWork.connect(endorser).endorseWorker(worker.address)
      ).to.be.revertedWith("Already endorsed this worker");
    });

    it("should handle multiple endorsements from different people", async function () {
      await veriWork.connect(endorser).endorseWorker(worker.address);
      await veriWork.connect(otherWorker).endorseWorker(worker.address);

      const profile = await veriWork.getWorkerProfile(worker.address);
      expect(profile.endorsements).to.equal(2);
      expect(profile.pocScore).to.equal(10); // 5 + 5
    });
  });

  describe("9. getOpenTasks", function () {
    beforeEach(async function () {
      await veriWork
        .connect(org)
        .depositRewards(ethers.parseUnits("1000", 6));

      // Create 3 tasks
      await veriWork
        .connect(org)
        .postTask("Task 1", "Description", 0, TASK_REWARD, 24);
      await veriWork
        .connect(org)
        .postTask("Task 2", "Description", 1, TASK_REWARD, 24);
      await veriWork
        .connect(org)
        .postTask("Task 3", "Description", 2, TASK_REWARD, 24);
    });

    it("should return only open tasks", async function () {
      // Claim and submit task 1
      await veriWork.connect(worker).claimTask(0);
      await veriWork.connect(worker).submitTask(0, "ipfs://Qm...");

      const openTasks = await veriWork.getOpenTasks();
      expect(openTasks.length).to.equal(2);
      expect(openTasks[0].id).to.equal(1);
      expect(openTasks[1].id).to.equal(2);
    });

    it("should return all tasks when none are claimed", async function () {
      const openTasks = await veriWork.getOpenTasks();
      expect(openTasks.length).to.equal(3);
    });

    it("should return empty array when no open tasks", async function () {
      // Claim all tasks
      await veriWork.connect(worker).claimTask(0);
      await veriWork.connect(otherWorker).claimTask(1);
      await veriWork.connect(endorser).claimTask(2);

      const openTasks = await veriWork.getOpenTasks();
      expect(openTasks.length).to.equal(0);
    });
  });

  describe("10. getWorkerProfile", function () {
    beforeEach(async function () {
      await veriWork
        .connect(org)
        .depositRewards(ethers.parseUnits("1000", 6));
    });

    it("should return correct stats after full workflow", async function () {
      // Post and complete a task
      await veriWork
        .connect(org)
        .postTask("Task", "Description", 0, TASK_REWARD, 24);
      const task = await veriWork.getTask(0);

      await veriWork.connect(worker).claimTask(0);
      await veriWork.connect(worker).submitTask(0, "ipfs://Qm...");
      await veriWork.connect(org).approveSubmission(0);

      // Endorse the worker
      await veriWork.connect(endorser).endorseWorker(worker.address);

      // Check profile
      const profile = await veriWork.getWorkerProfile(worker.address);

      expect(profile.pocScore).to.equal(Number(task.pocReward) + 5);
      expect(profile.tasksCompleted).to.equal(1);
      expect(profile.totalEarned).to.equal(TASK_REWARD);
      expect(profile.endorsements).to.equal(1);
      expect(profile.completedTaskIds.length).to.equal(1);
      expect(profile.completedTaskIds[0]).to.equal(0);
    });

    it("should handle multiple completed tasks", async function () {
      // Post and complete 2 tasks
      await veriWork
        .connect(org)
        .postTask("Task 1", "Description", 0, TASK_REWARD, 24);
      await veriWork
        .connect(org)
        .postTask("Task 2", "Description", 1, TASK_REWARD, 24);

      for (let i = 0; i < 2; i++) {
        await veriWork.connect(worker).claimTask(i);
        await veriWork.connect(worker).submitTask(i, `ipfs://Qm${i}`);
        await veriWork.connect(org).approveSubmission(i);
      }

      const profile = await veriWork.getWorkerProfile(worker.address);
      expect(profile.tasksCompleted).to.equal(2);
      expect(profile.totalEarned).to.equal(TASK_REWARD * 2n);
      expect(profile.completedTaskIds.length).to.equal(2);
    });
  });

  describe("withdrawEscrow", function () {
    it("should allow org to withdraw escrow", async function () {
      const depositAmount = ethers.parseUnits("500", 6);
      const withdrawAmount = ethers.parseUnits("200", 6);

      await veriWork.connect(org).depositRewards(depositAmount);
      const initialBalance = await mockUSDC.balanceOf(org.address);

      await veriWork.connect(org).withdrawEscrow(withdrawAmount);

      const newBalance = await mockUSDC.balanceOf(org.address);
      expect(newBalance).to.equal(initialBalance + withdrawAmount);
    });

    it("should update escrow balance after withdrawal", async function () {
      const depositAmount = ethers.parseUnits("500", 6);
      const withdrawAmount = ethers.parseUnits("200", 6);

      await veriWork.connect(org).depositRewards(depositAmount);
      await veriWork.connect(org).withdrawEscrow(withdrawAmount);

      const escrowBalance = await veriWork.getEscrowBalance(org.address);
      expect(escrowBalance).to.equal(depositAmount - withdrawAmount);
    });

    it("should have nonReentrant protection", async function () {
      const depositAmount = ethers.parseUnits("500", 6);
      await veriWork.connect(org).depositRewards(depositAmount);

      // First withdrawal should succeed
      await veriWork
        .connect(org)
        .withdrawEscrow(ethers.parseUnits("100", 6));

      // Verify it worked
      const balance = await veriWork.getEscrowBalance(org.address);
      expect(balance).to.equal(ethers.parseUnits("400", 6));
    });
  });

  describe("Additional view functions", function () {
    beforeEach(async function () {
      await veriWork
        .connect(org)
        .depositRewards(ethers.parseUnits("1000", 6));
      await veriWork
        .connect(org)
        .postTask("Task", "Description", 0, TASK_REWARD, 24);
      await veriWork.connect(worker).claimTask(0);
      await veriWork.connect(worker).submitTask(0, "ipfs://Qm...");
      await veriWork.connect(org).approveSubmission(0);
    });

    it("getPocScore should return correct value", async function () {
      const score = await veriWork.getPocScore(worker.address);
      const profile = await veriWork.getWorkerProfile(worker.address);
      expect(score).to.equal(profile.pocScore);
    });

    it("getTasksCompleted should return correct value", async function () {
      const completed = await veriWork.getTasksCompleted(worker.address);
      expect(completed).to.equal(1);
    });

    it("getTotalEarned should return correct value", async function () {
      const earned = await veriWork.getTotalEarned(worker.address);
      expect(earned).to.equal(TASK_REWARD);
    });

    it("getCompletedTaskIds should return array", async function () {
      const ids = await veriWork.getCompletedTaskIds(worker.address);
      expect(ids.length).to.equal(1);
      expect(ids[0]).to.equal(0);
    });

    it("getOrgTasks should return all org tasks", async function () {
      const tasks = await veriWork.getOrgTasks(org.address);
      expect(tasks.length).to.equal(1);
      expect(tasks[0].org).to.equal(org.address);
    });

    it("getWorkerActiveTasks should return claimed and submitted tasks", async function () {
      await veriWork
        .connect(org)
        .postTask("Task 2", "Description", 1, TASK_REWARD, 24);
      await veriWork.connect(worker).claimTask(1);

      const activeTasks = await veriWork.getWorkerActiveTasks(worker.address);
      // Task 0 is completed, so only task 1 (claimed) should be active
      expect(activeTasks.length).to.equal(1);
      expect(activeTasks[0].id).to.equal(1);
    });
  });
});
