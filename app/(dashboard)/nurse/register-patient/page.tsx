"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { registerPatient } from "@/src/services/patientService";

import { PatientRegisterDto } from "@/src/types/patient";
import { toast } from "sonner";
import { RoleGaurd } from "@/src/security/RoleGuard";

export default function RegisterPatientPage() {

    const router = useRouter();

    const [loading,setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const [form,setForm] = useState({
        name:"",
        dateOfBirth:"",
        gender:"MALE",
        phone:"",
        location:""
    });

    const handleChange=(e:any)=>{

        setForm({
            ...form,
            [e.target.name]:e.target.value
        });

    };

    const submit=async(e:any)=>{

        e.preventDefault();

        try{
            setErrors({}); // Clear previous errors
            setLoading(true);
            const response =await registerPatient(form);
            toast.success("Patient Registered")
            router.push("/nurse");
        }catch(err:any){
            setErrors(err);
        }finally{
            setLoading(false);
        }
    };

    return(

<RoleGaurd allowed={["DOCTOR", "NURSE", "RECEPTIONIST", "ADMIN"]}>
<div className="max-w-2xl mx-auto p-4 sm:p-6">

<h1 className="text-3xl font-bold mb-6">
Register Patient
</h1>

<form
onSubmit={submit}
className="bg-white shadow rounded-xl p-6 space-y-5"
>

<div>

<label>Name</label>

<input
name="name"
value={form.name}
onChange={handleChange}
className="w-full border rounded-lg p-3 mt-1"
/>
{errors.name && (
    <p className="text-red-500 text-sm mt-1">
        {errors.name}
    </p>
)}

</div>

<div>

<label>Date Of Birth</label>

<input
type="date"
name="dateOfBirth"
value={form.dateOfBirth}
onChange={handleChange}
className="w-full border rounded-lg p-3 mt-1"
/>
{errors.phone && (
    <p className="text-red-500 text-sm mt-1">
        {errors.dateOfBirth}
    </p>
)}

</div>

<div>

<label>Gender</label>

<select
name="gender"
value={form.gender}
onChange={handleChange}
className="w-full border rounded-lg p-3 mt-1"
>

<option value="MALE">MALE</option>
<option value="FEMALE">FEMALE</option>
<option value="OTHER">OTHER</option>

</select>

</div>

<div>

<label>Phone Number</label>

<input
name="phone"
maxLength={10}
value={form.phone}
onChange={handleChange}
className="w-full border rounded-lg p-3 mt-1"
/>
{errors.phone && (
    <p className="text-red-500 text-sm mt-1">
        {errors.phone}
    </p>
)}

</div>

<div>

<label>Location</label>

<input
name="location"
value={form.location}
onChange={handleChange}
className="w-full border rounded-lg p-3 mt-1"
/>

</div>

<div className="flex gap-3">

<button
type="button"
onClick={()=>router.back()}
className="flex-1 border rounded-lg py-3"
>

Cancel

</button>

<button
type="submit"
disabled={loading}
className="flex-1 bg-blue-600 text-white rounded-lg py-3"
>

{loading?"Registering...":"Register Patient"}

</button>

</div>

</form>

</div>
</RoleGaurd>

    );

}