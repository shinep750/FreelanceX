import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("EscrowModule", (m) => {
  const dummy = m.contract("Dummy");
  const escrow = m.contract("Escrow", [], { after: [dummy] });
  return { escrow };
});
