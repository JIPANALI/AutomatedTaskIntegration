"use client";

// import { BACKEND_URL } from "@/app/config";
import { BACKEND_URL } from "@/app/config";
import { Appbar } from "@/components/Appbar";
import { Input } from "@/components/Input";
import { ZapCell } from "@/components/ZapCell";
import { LinkButton } from "@/components/buttons/LinkButton";
import { PrimaryButton } from "@/components/buttons/PrimaryButton";
import axios from "axios";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";




// this is useHooks for getting the available trigger and available action
function useAvailableActionsAndTriggers() {
    const [availableActions, setAvailableActions] = useState([]);
    const [availableTriggers, setAvailableTriggers] = useState([]);

    useEffect(() => {
        axios.get(`${BACKEND_URL}/api/v1/trigger/available`)
            .then(x => setAvailableTriggers(x.data.availableTriggers))

        axios.get(`${BACKEND_URL}/api/v1/action/available`)
            .then(x => setAvailableActions(x.data.availableActions))
    }, [])

    return {
        availableActions,
        availableTriggers
    }
}

// this is the main component
export default function() {
    const router = useRouter();
    const { data: session, status } = useSession();
    console.log("hello",session)

    //this is the data from the customHook availableAction and available trigger from the backend api
    const { availableActions, availableTriggers } = useAvailableActionsAndTriggers();

    //here we will use the which trigger you will select then when you post api means you will send the post zap create
    const [selectedTrigger, setSelectedTrigger] = useState<{
        id: string;
        name: string;
    }>();

     //here we will use the which action you will select then when you post api means you will send the post zap create
    const [selectedActions, setSelectedActions] = useState<{
        index: number;
        availableActionId: string;
        availableActionName: string;
        metadata: any;
    }[]>([]);

    //Means when you will create zap you will select the bunch of action and trigger that will be in each modal there will index
    const [selectedModalIndex, setSelectedModalIndex] = useState<null | number>(null);

    return <div>
        <Appbar />{/*Normally appbar */}
        
        <div className="flex justify-end bg-slate-200 p-4">

        
            {/* when you all of these seleted then you will publish to zap(create) after publish this button there will zap created */}
            <PrimaryButton onClick={async () => {
                if (!selectedTrigger?.id) {
                    return;
                }

                const response = await axios.post(`${BACKEND_URL}/api/v1/zap`, {
                    "availableTriggerId": selectedTrigger.id,//here selected Trigger id put
                    "triggerMetadata": {},//trigger meta empty because it will come from webhook like github commit
                    "actions": selectedActions.map(a => ({//here how many action will be available those are will be put here
                        availableActionId: a.availableActionId,
                        actionMetadata: a.metadata
                    }))
                }, {
                    headers: {
                        Authorization: localStorage.getItem("token") //here when it was login at that time token was saved and take from there send it so zap will create for some speecifi user id
                         //here when it was login at that time token was saved and take from there send it so zap will create for some speecifi user id
                    }
                })
                
                //if response will success full then this line will be excute which means you will see the you zap is createds
                router.push("/dashboard");

            }}>Publish</PrimaryButton>
        </div>
        <div className="w-full min-h-screen bg-slate-200 flex flex-col justify-center">

            {/* this is for each cell box and this is for trigger cell webhook ------------------*/}
            <div className="flex justify-center w-full">
                <ZapCell onClick={() => { //when we will click on that cell it will pass as props onClick,name,index
                    setSelectedModalIndex(1);//it means its trigger so make modalIndex is 1
                }} name={selectedTrigger?.name ? selectedTrigger.name : "Trigger"} index={1} />
            </div>

            {/* this is for the action  zapCell----------------------------- */}
            <div className="w-full pt-2 pb-2">
                {/* here all action will show in this zap cell */}
                {/* here also we will pass the onClick and name and index as a props */}
                {selectedActions.map((action, index) => <div className="pt-2 flex justify-center"> <ZapCell onClick={() => {
                    setSelectedModalIndex(action.index);
                }} name={action.availableActionName ? action.availableActionName : "Action"} index={action.index} /> </div>)}
            </div>

                {/* this when you will press the + button for more action you will add */}
            <div className="flex justify-center">
                <div>
                    <PrimaryButton onClick={() => {
                        setSelectedActions(a => [...a, {
                            index: a.length + 2,    //means first time a.length==>0 and 0+2==>2, second time a.length==>1 so 1+2==>3
                            availableActionId: "",
                            availableActionName: "",
                            metadata: {}
                        }])
                        /*here all of these are empty except index because still we did not set the  
                         availableActionId: "",
                            availableActionName: "",
                            metadata: {} */
                    }}><div className="text-2xl">
                        +
                    </div></PrimaryButton>
                </div>
            </div>
        </div>

        {/* when you will click on the zapcell there was onlclick previously there was onclick passed so in oncllick selectedIndex was set so there in zapcell click this will be opo up */}
        {/* if  selectedModalIndex === 1  means it will for for availabletrigger else it for availableAction that will onSelect pass as props in Modal */}
        {selectedModalIndex && <Modal availableItems={selectedModalIndex === 1 ? availableTriggers : availableActions} onSelect={(props: null | { name: string; id: string; metadata: any; }) => {
            //---------------------------------all are these passing as props in modal   
           if (props === null) {
                setSelectedModalIndex(null);
                return;
            }
            // if selectedModalIndex==1 then that means it will for the trigger and in that case 
            if (selectedModalIndex === 1) {//set selected trigger will be set 
                setSelectedTrigger({
                    id: props.id, //means which will in modal return after the modal selected onSelect on props then that id
                    name: props.name
                })
            } else {//else it will for action
                setSelectedActions(a => {///set selected action
                    let newActions = [...a];//what was the previous action that will put in newActions
                    newActions[selectedModalIndex - 2] = {//after that Array should be start from 0,1,2... so so modalIndex-2 evey time
                        index: selectedModalIndex,//
                        availableActionId: props.id,
                        availableActionName: props.name,
                        metadata: props.metadata
                    }
                    return newActions //return the new Actionn
                })
            }
            setSelectedModalIndex(null);//after that all of these selected it set to this null so it will close the modal
        }} index={selectedModalIndex} />
        // ------------------------------------------------------------------Modal props end here
    }
    </div>
}



// Actual Modal is start and taking props----------------------------------------->
function Modal({ index, onSelect, availableItems }: { index: number, onSelect: (props: null | { name: string; id: string; metadata: any; }) => void, availableItems: {id: string, name: string, image: string;}[] }) {
    const [step, setStep] = useState(0);
    const [selectedAction, setSelectedAction] = useState<{
        id: string;
        name: string;
    }>();
    const isTrigger = index === 1;

    return <div className="fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full bg-slate-100 bg-opacity-70 flex">
        <div className="relative p-4 w-full max-w-2xl max-h-full">
            <div className="relative bg-white rounded-lg shadow ">
                <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t ">
                    <div className="text-xl">
                        Select {index === 1 ? "Trigger" : "Action"}
                    </div>
                    <button onClick={() => {
                        onSelect(null);  //if modal will press the close button then on select will null so it will  it will be null nothing is selected
                    }} type="button" className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center" data-modal-hide="default-modal">
                        <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
                        </svg>
                        <span className="sr-only">Close modal</span>
                    </button>
                </div>
                <div className="p-4 md:p-5 space-y-4">
                    {step === 1 && selectedAction?.id === "email" && <EmailSelector setMetadata={(metadata) => {
                        onSelect({ ////this is selected at the step==0 and else part after here we came
                            ...selectedAction,
                            metadata
                        })
                    }} />}

                    {/* when step will be 1 and selectedAction then it will popup */}
                    {(step === 1 && selectedAction?.id === "send-sol") && <SolanaSelector setMetadata={(metadata) => {
                        onSelect({
                            ...selectedAction,//this is selected at the step==0 and else part after here we came
                            metadata
                        })
                    }} />}

                    {/* this first time when it will first time when it is step ==0  */}
                    {step === 0 && <div>{availableItems.map(({id, name, image}) => {
                            return <div onClick={() => {
                                if (isTrigger) {//if isTrigger is true means if it was index==1 which means it is isTrigger is true
                                    onSelect({//
                                        id, //this is availableItems.id
                                        name,
                                        metadata: {} //it is empty set so it will come from webhook like from github
                                    })
                                } else {//else part means id not trigger which means when action 
                                    setStep(s => s + 1);
                                    setSelectedAction({  ///here setting the value and after that when it will come after this line execute then it willl come to this line   {(step === 1 && selectedAction?.id === "send-sol") && <SolanaSelector setMetadata={(metadata) => { ==>here we will do the onSelect send it to where it was come(means where it from call like which modal)
                                        id,
                                        name
                                    })
                                }
                            }} className="flex border p-4 cursor-pointer hover:bg-slate-100">
                                <img src={image} width={30} className="rounded-full" /> <div className="flex flex-col justify-center"> {name} </div>
                            </div>
                        })}</div>}                    
                </div>
            </div>
        </div>
    </div>

}




// after Action is selected then it will come one more popup whicch is what will take from from the  github webhook
function EmailSelector({setMetadata}: {
    setMetadata: (params: any) => void;
}) {
    const [email, setEmail] = useState("");
    const [body, setBody] = useState("");

    return <div>
        <Input label={"To"} type={"text"} placeholder="To" onChange={(e) => setEmail(e.target.value)}></Input>
        <Input label={"Body"} type={"text"} placeholder="Body" onChange={(e) => setBody(e.target.value)}></Input>
        <div className="pt-2">
            <PrimaryButton onClick={() => {
                setMetadata({
                    email,
                    body
                })
            }}>Submit</PrimaryButton>
        </div>
    </div>
}




// after Action is selected then it will come one more popup whicch is what will take from from the  github webhook
function SolanaSelector({setMetadata}: {
    setMetadata: (params: any) => void;
}) {
    const [amount, setAmount] = useState("");
    const [address, setAddress] = useState("");    

    return <div>
        <Input label={"To"} type={"text"} placeholder="To" onChange={(e) => setAddress(e.target.value)}></Input>
        <Input label={"Amount"} type={"text"} placeholder="To" onChange={(e) => setAmount(e.target.value)}></Input>
        <div className="pt-4">
        <PrimaryButton onClick={() => {
            setMetadata({
                amount,
                address
            })
        }}>Submit</PrimaryButton>
        </div>
    </div>
}