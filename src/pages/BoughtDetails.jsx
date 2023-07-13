import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';


import { useStateContext } from '../context';
import { CountBox, CustomButton, Loader } from '../components';
import { calculateBarPercentage, daysLeft } from '../utils';
import { thirdweb } from '../assets';

const BoughtDetails = () => {
    const { state } = useLocation();
    console.log(state)
    const navigate = useNavigate();
    const { donate, getDonations, contract, address } = useStateContext();
    const [isLoading, setIsLoading] = useState(false);
    const fetchDonators = async () => {
        const data = await getDonations(state.pId);
        setDonators(data);
    };

    useEffect(() => {
        if (contract) fetchDonators();
    }, [contract, address]);

    const handleDonate = async () => {
        setIsLoading(true);
        await donate(state.pId, amount);

        navigate('/');
        setIsLoading(false);
    };

    const [selectedPhases, setSelectedPhases] = useState([]);

    const handlePhaseChange = (phase) => {
        if (selectedPhases.includes(phase)) {
            setSelectedPhases(selectedPhases.filter((p) => p !== phase));
        } else {
            setSelectedPhases([...selectedPhases, phase]);
        }
    };

    return (
        <div>
            {isLoading && <Loader />}

            <div className="w-full flex md:flex-row flex-col mt-10 gap-[30px]">
                <div className="flex-1 flex-col">
                    <img
                        src={state.image}
                        alt="campaign"
                        className="w-full h-[410px] object-cover rounded-xl"
                    />
                </div>
            </div>

            <div className="mt-[60px] flex lg:flex-row flex-col gap-5">
                <div className="flex-[2] flex flex-col gap-[40px]">
                    <div>
                        <h4 className="font-epilogue font-semibold text-[18px] text-white uppercase">The Art Title</h4>

                        <div className="mt-[20px] flex flex-row items-center flex-wrap gap-[14px]">
                            <div className="w-[52px] h-[52px] flex items-center justify-center rounded-full bg-[#2c2f32] cursor-pointer">
                                <img src={thirdweb} alt="user" className="w-[60%] h-[60%] object-contain" />
                            </div>
                            <div>
                                <h4 className="font-epilogue font-semibold text-[14px] text-white break-all">AuthorName</h4>
                                <p className="mt-[4px] font-epilogue font-normal text-[12px] text-[#808191]">Author Username</p>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h4 className="font-epilogue font-semibold text-[18px] text-white uppercase">Description</h4>

                        <div className="mt-[20px]">
                            <p className="font-epilogue font-normal text-[16px] text-[#808191] leading-[26px] text-justify">
                                {state.description}
                            </p>
                        </div>
                    </div>

                    <div>
                        <h4 className="font-epilogue font-semibold text-[18px] text-white uppercase">Delivery Phases</h4>
                        {/* Four checkboxes for delivery phases */}
                        <div className="flex flex-col gap-2 mt-2 font-epilogue font-normal text-[16px] text-[#808191] leading-[26px] space-between text-justify">
                            <label>
                                <input
                                    type="checkbox"
                                    checked={selectedPhases.includes('Dispatched')}
                                    onChange={() => handlePhaseChange('Dispatched')}

                                />
                                Dispatched from the Warehouse
                            </label>
                            <label>
                                <input
                                    type="checkbox"
                                    checked={selectedPhases.includes('DeliveryService')}
                                    onChange={() => handlePhaseChange('DeliveryService')}
                                />
                                In Possession of the Delivery Service
                            </label>
                            <label>
                                <input
                                    type="checkbox"
                                    checked={selectedPhases.includes('Delivered')}
                                    onChange={() => handlePhaseChange('Delivered')}
                                />
                                Delivered
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BoughtDetails;