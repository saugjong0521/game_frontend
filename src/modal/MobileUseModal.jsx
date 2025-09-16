import { error } from "@/assets";

export default function MobileUseModal (){

    return(
        <>
            <div className="fixed inset-0 w-full h-full z-50 bg-[#ffffff] flex flex-col items-center justify-center gap-0.5">
                <img src={error} className="w-auto h-auto object-none relative mb-1"/>
                <p className="font-semibold text-[#000000] text-base">Only mobile version is supported</p>
                <p className="font-medium text-[#5C6877] text-sm">We do not currently support PC and tablet.</p>
                <p className="font-medium text-[#5C6877] text-sm">Please connect to your mobile.</p>
            </div>
        </>
    )
}