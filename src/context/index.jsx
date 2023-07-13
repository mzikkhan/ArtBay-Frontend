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
  const artwork_contract  = new web3.eth.Contract(artworkAbi, "0xC589a897238dC228369cB1390A5153B194887129");

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

  const getArtworks = async () => {
    const artworks = await artwork_contract.methods.getArtworks().call();
    const parsedArtworks = artworks.map((artwork, i) => ({
      owner: artwork.owner,
      credentials: artwork.credentials,
      description: artwork.description,
      price: ethers.utils.formatEther(artwork.price.toString()),
      quantity: Number(artwork.quantity), 
      image: artwork.image,
      pId: i
    }));

    return parsedArtworks;
  }

  const getUserCampaigns = async () => {
    const allArtworks = await artwork_contract.methods.getArtworks().call();

    const filteredArtworks = allArtworks.filter((artwork) => artwork.owner === address);

    return filteredArtworks;
  }

  const getPurchasesBuyer = async () => {
    const allPurchases = await artwork_contract.methods.getPurchases().call();
    const filteredPurchases = allPurchases.filter((purchase) => purchase.buyer === address);
    return filteredPurchases;
  }

  const getPurchasesSeller = async () => {
    const allPurchases = await artwork_contract.methods.getPurchases().call();
    const filteredPurchases = allPurchases.filter((purchase) => purchase.seller === address);
    return filteredPurchases;
  }

  const buy = async (pId, amount) => {
    const weiAmount = amount*1e18;
    const data = await artwork_contract.methods.buyArtwork(pId).send({ value: weiAmount , from: address, gasLimit: 1e7 });
    console.log(data);
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
        ).send({ from: address, gas: 25000000 });
    
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
        getArtworks,
        getUserCampaigns,
        buy,
        getDonations,
        registerUser,
        getType,
        createArt,
        getPurchasesBuyer,
        getPurchasesSeller,
      }}
    >
      {children}
    </StateContext.Provider>
  )
}

export const useStateContext = () => useContext(StateContext);