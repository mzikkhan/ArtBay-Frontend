import React, { useContext, createContext } from 'react';

import { useAddress, useContract, useMetamask, useContractWrite } from '@thirdweb-dev/react';
import { ethers } from 'ethers';
import { EditionMetadataWithOwnerOutputSchema } from '@thirdweb-dev/sdk';
import Web3 from "web3";
import crowdFundingAbi from "../abis/CrowdFunding.json";
const StateContext = createContext();

export const StateContextProvider = ({ children }) => {
  // Contract address
  // const { contract } = useContract('0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199');
  const web3 = new Web3(window.ethereum);
  const contract  = new web3.eth.Contract(crowdFundingAbi, "0xD215FA79247763E07ca7d170a3f623D02caAb1f3");
  // const { mutateAsync: createCampaign } = useContractWrite(contract, 'createCampaign');

  const address = useAddress();
  const connect = useMetamask();

  const publishCampaign = async (form) => {
    const target = form.target/1000000000000000000;
    try {
      const data = await contract.methods.createCampaign(
        address, // owner
        form.title, // title
        form.description, // description
        target,
        new Date(form.deadline).getTime(), // deadline,
        form.image
      ).send({ from: address, gas: 1e7 });
      

      console.log("contract call success", data)
    } catch (error) {
      console.log("contract call failure", error)
    }
  }

  const getCampaigns = async () => {
    const campaigns = await contract.methods.getCampaigns().call();
    const parsedCampaings = campaigns.map((campaign, i) => ({
      owner: campaign.owner,
      title: campaign.title,
      description: campaign.description,
      target: ethers.utils.formatEther(campaign.target.toString()),
      deadline: Number(campaign.deadline), 
      amountCollected: ethers.utils.formatEther(campaign.amountCollected.toString()),
      image: campaign.image,
      pId: i
    }));

    return parsedCampaings;
  }

  const getUserCampaigns = async () => {
    const allCampaigns = await getCampaigns();

    const filteredCampaigns = allCampaigns.filter((campaign) => campaign.owner === address);

    return filteredCampaigns;
  }

  const donate = async (pId, amount) => {
    const data = await contract.methods.donateToCampaign(pId, { value: ethers.utils.parseEther(amount)}).send({ from: address, gas: 1e7 });
    console.log(data)
    return data;
  }

  const getDonations = async (pId) => {
    const donations = await contract.methods.getDonators().call( [pId]);
    const numberOfDonations = donations[0].length;

    const parsedDonations = [];

    for(let i = 0; i < numberOfDonations; i++) {
      parsedDonations.push({
        donator: donations[0][i],
        donation: ethers.utils.formatEther(donations[1][i].toString())
      })
    }

    return parsedDonations;
  }


  return (
    <StateContext.Provider
      value={{ 
        address,
        contract,
        connect,
        createCampaign: publishCampaign,
        getCampaigns,
        getUserCampaigns,
        donate,
        getDonations
      }}
    >
      {children}
    </StateContext.Provider>
  )
}

export const useStateContext = () => useContext(StateContext);