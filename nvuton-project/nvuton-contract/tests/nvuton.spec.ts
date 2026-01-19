import { Blockchain } from '@ton/sandbox';
import { toNano } from '@ton/core';
import { Nvuton } from '../wrappers/Nvuton';

describe('Nvuton', () => {
  it('should deploy', async () => {
    const blockchain = await Blockchain.create();
    const nvuton = blockchain.openContract(await Nvuton.fromInit());
    await nvuton.send({ amount: toNano('0.05'), bounce: false });
  });
});