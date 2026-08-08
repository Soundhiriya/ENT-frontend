import React, { useEffect } from 'react'
import { AppointmentQueueDto, Patient } from '../types/patient'
import DoctorWorkspace from './DoctorWorkspace'
import DoctorQueuePanel from './DoctorQueuePanel'

interface DoctorMainScreenProps{
    selectedPatient:Patient | null
    queue:AppointmentQueueDto[]
    selectedAppointmentId:number | null
    onSelect:(appointmentId:number) => Promise<void>
    onSelectCompleted?:(consultationId:number) => void
}

const DoctorMainScreen = ({selectedPatient,queue,selectedAppointmentId,onSelect,onSelectCompleted}:DoctorMainScreenProps) => {

    useEffect(() =>{
        if(selectedPatient != null)
        console.log("Ia m the patient dr gonna consult now",selectedPatient.name);
    },[selectedPatient])
return (
    <div className="flex h-full gap-6">

        <DoctorWorkspace 
        selectedPatient={selectedPatient}
        selectedAppointmentId={selectedAppointmentId}/>

        <DoctorQueuePanel
            queue={queue}
            selectedAppointmentId={selectedAppointmentId}
            onSelect={onSelect}
            onSelectCompleted={onSelectCompleted}
        />
    
    
        </div>
)
}

export default DoctorMainScreen