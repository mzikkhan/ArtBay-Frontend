import React, { useContext, createContext } from 'react';

import { useAddress, useContract, useMetamask, useContractWrite } from '@thirdweb-dev/react';
import { ethers } from 'ethers';
import { EditionMetadataWithOwnerOutputSchema } from '@thirdweb-dev/sdk';
import Web3 from "web3";
import crowdFundingAbi from "../abis/CrowdFunding.json";
import registerAbi from "../abis/Register.json";
import artworkAbi from "../abis/Artwork.json";
const StateContext = createContext();

export const StateContextProvider = ({ children }) => {
  // Contract address
  const web3 = new Web3(window.ethereum);
  const contract  = new web3.eth.Contract(crowdFundingAbi, "0xD215FA79247763E07ca7d170a3f623D02caAb1f3");
  const register_contract  = new web3.eth.Contract(registerAbi, "0x747f7994546FF4E8D043f5d8EB708Bb7986c3CCc");
  const artwork_contract  = new web3.eth.Contract(artworkAbi, "0xD75F472e4Bb793EA5495A677C6E1138889D0D4FF");

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

  // Register User   
  const registerUser = async (wallet, type) => {
    try {
      const data = await register_contract.methods.registerUser(
        wallet,
        type,
      ).send({ from: address, gas: 1e7 });
      console.log("contract call success", data)
    } catch (error) {
      console.log("contract call failure", error)
    }
  }

  // Get User Type   
  const getType = async () => {
    const res = await register_contract.methods.getUser(address).call();
    return res;
  }

  // Create Artwork
  const createArt = async (form) => {
    try{
      const data = await artwork_contract.methods.createArt(
        address,
        form.image,
        form.description,
        form.price,
        form.artist_username,
        form.quantity
        ).send({ from: address, gas: 1e7 });
    
      console.log("contract call success", data);
    }

    catch(error) {
      console.log(error);
      console.log("didnt work yo")
    }
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
        getDonations,
        registerUser,
        getType,
        createArt,
      }}
    >
      {children}
    </StateContext.Provider>
  )
}

export const useStateContext = () => useContext(StateContext);