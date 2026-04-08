import { expect } from "chai";
import hre from "hardhat";
const { ethers } = hre;

describe("Escrow", function () {
    let Escrow;
    let escrow;
    let owner;
    let client;
    let freelancer;

    beforeEach(async function () {
        [owner, client, freelancer] = await ethers.getSigners();
        Escrow = await ethers.getContractFactory("Escrow");
        escrow = await Escrow.deploy();
    });

    it("Should deploy and set the correct admin", async function () {
        expect(await escrow.admin()).to.equal(owner.address);
    });

    it("Should allow client to fund a milestone", async function () {
        const projectId = 1;
        const fundAmount = ethers.parseEther("1.0");

        await expect(escrow.connect(client).fundMilestone(projectId, freelancer.address, { value: fundAmount }))
            .to.emit(escrow, "MilestoneFunded")
            .withArgs(1, client.address, fundAmount);

        const milestone = await escrow.milestones(1);
        expect(milestone.projectId).to.equal(1n);
        expect(milestone.client).to.equal(client.address);
        expect(milestone.freelancer).to.equal(freelancer.address);
        expect(milestone.amount).to.equal(fundAmount);
        expect(milestone.status).to.equal(1n); // 1 = Funded
    });

    it("Should allow client to release payment", async function () {
        const projectId = 1;
        const fundAmount = ethers.parseEther("1.0");

        await escrow.connect(client).fundMilestone(projectId, freelancer.address, { value: fundAmount });

        const initialBalance = await ethers.provider.getBalance(freelancer.address);

        await expect(escrow.connect(client).releasePayment(1))
            .to.emit(escrow, "PaymentReleased")
            .withArgs(1, freelancer.address, fundAmount);

        const finalBalance = await ethers.provider.getBalance(freelancer.address);
        expect(finalBalance - initialBalance).to.equal(fundAmount);

        const milestone = await escrow.milestones(1);
        expect(milestone.status).to.equal(4n); // 4 = Released
    });

    it("Should allow participants to raise a dispute", async function () {
        const projectId = 1;
        const fundAmount = ethers.parseEther("1.0");

        await escrow.connect(client).fundMilestone(projectId, freelancer.address, { value: fundAmount });

        await expect(escrow.connect(freelancer).raiseDispute(1))
            .to.emit(escrow, "DisputeRaised")
            .withArgs(1, freelancer.address);

        const milestone = await escrow.milestones(1);
        expect(milestone.status).to.equal(5n); // 5 = Disputed
    });

    it("Should allow admin to resolve a dispute to freelancer", async function () {
        const fundAmount = ethers.parseEther("1.0");
        await escrow.connect(client).fundMilestone(1, freelancer.address, { value: fundAmount });
        await escrow.connect(freelancer).raiseDispute(1);

        const initialBalance = await ethers.provider.getBalance(freelancer.address);

        await expect(escrow.connect(owner).resolveDispute(1, true))
            .to.emit(escrow, "DisputeResolved")
            .withArgs(1, true);

        const finalBalance = await ethers.provider.getBalance(freelancer.address);
        expect(finalBalance - initialBalance).to.equal(fundAmount);
    });

    it("Should allow admin to resolve a dispute to client", async function () {
        const fundAmount = ethers.parseEther("1.0");
        await escrow.connect(client).fundMilestone(1, freelancer.address, { value: fundAmount });
        await escrow.connect(client).raiseDispute(1);

        const initialBalance = await ethers.provider.getBalance(client.address);

        // Client pays gas for raising dispute, so final amount is less precise, but we check change
        await expect(escrow.connect(owner).resolveDispute(1, false))
            .to.emit(escrow, "DisputeResolved")
            .withArgs(1, false);

        const finalBalance = await ethers.provider.getBalance(client.address);
        expect(finalBalance > initialBalance).to.equal(true); // Gained some ether back
    });
});
