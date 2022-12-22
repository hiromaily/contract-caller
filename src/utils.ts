import { ethers } from "ethers";
import type Web3 from 'web3'


export const encodeParams = (web3: Web3, types: ReadonlyArray<string>, values: ReadonlyArray<any>, packed: boolean = false) => {
  if (!packed) {
      return web3.eth.abi.encodeParameters(types as any[], values as any[])
  } else {
      return ethers.utils.solidityPack(types, values)
  }
}

export const encodePackedParams = (web3: Web3, types: ReadonlyArray<string>, values: ReadonlyArray<any>) => {
  return encodeParams(web3, types, values, true)
}
