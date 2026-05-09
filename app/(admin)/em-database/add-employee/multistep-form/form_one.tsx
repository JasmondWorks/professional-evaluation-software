'use client';

import { ChangeEvent, useEffect, useState, Dispatch, SetStateAction } from 'react';

type FormProps = {
  formdata: Record<string, any>;
  setCredentialData: Dispatch<SetStateAction<Record<string, string>>>;
  updateFields: (data: Record<string, any>) => void;
  setStepValid: (data: boolean) => void;
  selectedFile: string;
  setSelectedFile: (file: string) => void;
};

// --------------------------------------
// Stable Phone Input (No Focus Loss)
// --------------------------------------
function PhoneInput({ name, label, placeholder, value, onChange }: {
  name: string;
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (val: string) => void;
}) {
  const [localValue, setLocalValue] = useState(value || "");

  useEffect(() => {
    setLocalValue(value || "");
  }, [value]);

  function formatPhone(num: string) {
    num = num.replace(/\D/g, "");

    if (num.startsWith("234")) num = "+" + num;
    if (num.startsWith("0")) num = "+234" + num.slice(1);
    if (!num.startsWith("+234")) num = "+234" + num;

    const rest = num.replace("+234", "");
    const p1 = rest.slice(0, 3);
    const p2 = rest.slice(3, 6);
    const p3 = rest.slice(6, 10);

    let formatted = "+234";
    if (p1) formatted += " " + p1;
    if (p2) formatted += " " + p2;
    if (p3) formatted += " " + p3;

    return formatted;
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setLocalValue(e.target.value.replace(/[^\d+]/g, ""));
  }

  function handleBlur() {
    const formatted = formatPhone(localValue);
    setLocalValue(formatted);
    onChange(formatted);
  }

  return (
    <div className="my-4 w-full">
      {label && <label className="text-gray-800 placeholder-gray-500 font-bold text-lg placeholder-lg block mb-1">{label}</label>}
      <input
        type="text"
        name={name}
        value={localValue}
        placeholder={placeholder}
        onChange={handleChange}
        onBlur={handleBlur}
        className="border font-bold border-gray-300 rounded p-2 w-full outline-none focus:border-black"
        maxLength={16}
      />
    </div>
  );
}

// --------------------------------------
// MAIN FORM COMPONENT (STABLE LAYOUT)
// --------------------------------------
export default function FormOne({ formdata, setCredentialData, updateFields, setStepValid, selectedFile, setSelectedFile }: FormProps) {
  const requiredFields = [
    'name', 'address', 'faculty_college', 'email', 'gsm', 'dept',
    'dob', 'doa', 'post', 'doc', 'role', 'dopp', 'level', 'year', 'qualification', 'credential'
  ];
  // const [selectedFile, setSelectedFile] = useState(""); 

  const [errors, setErrors] = useState<Record<string, string>>({});

  function validateField(name: string, value: string) {
    let error = "";

    if (!value.trim()) error = "This field is required.";

    if (name === "email" && value.trim()) {
      const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!regex.test(value)) error = "Enter a valid email address.";
    }

    if (name === "gsm" && value.trim()) {
      const digits = value.replace(/\D/g, "");
      if (digits.length < 7 || digits.length > 15) error = "Phone number must be 7–15 digits.";
    }

    if (["dob", "doa", "doc", "dopp"].includes(name) && value.trim()) {
      const today = new Date().toISOString().split("T")[0];
      if (value > today) error = "Date cannot be in the future.";
    }

    setErrors(prev => ({ ...prev, [name]: error }));
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    updateFields({ [name]: value });
    validateField(name, value);
  }

  async function handleFileUpload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    const labelName = e.target.id;
    const { name, value } = e.target;
    updateFields({ [name]: value });
    validateField(name, value);

    if (!file) return;

    setSelectedFile(file.name);

    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", "pes_unsigned");
    data.append("folder", `pes/${formdata?.email}/credentials/${labelName}`);

    try {
      const cloudRes = await fetch(
        "https://api.cloudinary.com/v1_1/duvqe45ds/image/upload",
        {
          method: "POST",
          body: data
        }
      );
      const uploaded = await cloudRes.json();

      setCredentialData((prev: any) => {
        return {...prev, [labelName]:uploaded.secure_url }        
      }
    );

    } catch (err) {
      console.log(err);
    }
  }

  useEffect(() => {
    const allFilled = requiredFields.every(f => formdata[f]?.trim());
    const noErrors = Object.values(errors).every(err => err === "");
    setStepValid(allFilled && noErrors);
  }, [formdata, errors]);

  const Input = ({
    name,
    label,
    type = "text",
    placeholder,
    classNameProp
  }: {
    name: string;
    label: string;
    type?: string;
    placeholder?: string;
    classNameProp?: string
  }) => {
    const [localValue, setLocalValue] = useState(formdata[name] || "");

    // Sync external updates (but not while typing)
    useEffect(() => {
      if (formdata[name] !== localValue) {
        setLocalValue(formdata[name] || "");
      }
    }, [formdata[name]]);

    return (
      <div className={`formgroup flex flex-col my-2 w-full ${ classNameProp }`}>
        <label className="my-2 text-sm">{label}</label>

        <input
          name={name}
          type={type}
          value={localValue}
          placeholder={placeholder}
          onChange={(e) => {
            setLocalValue(e.target.value);
          }}
          onBlur={(e) => {
            updateFields({ [name]: e.target.value });
            validateField(name, e.target.value);
          }}
          className={`font-medium text-lg text-gray-800 placeholder-gray-500 py-3 px-6 outline-0 border rounded-sm focus:border-gray-400`}
        />

        {errors[name] && (
          <p className="text-red-500 text-xs mt-1">{errors[name]}</p>
        )}
      </div>
    );
  };


  return (
    <div className="flex flex-col gap-8 w-full px-10">

      {/* Row 1 */}
      <div className="grid grid-cols-2 gap-10">
        <div>
          <Input name="name" label="Employee's Full Name:" placeholder="Enter full name" />
          <Input name="address" label="Current Home Address:" placeholder="Home address" />
          <Input name="faculty_college" label="Faculty/College:" placeholder="Enter faculty" />
        </div>

        <div>
          <Input name="email" label="Employee's Email Address:" placeholder="Enter email" />

          <PhoneInput
            name="gsm"
            label="Phone Number:"
            placeholder="Enter phone number"
            value={formdata.gsm || ""}
            onChange={(v) => {
              updateFields({ gsm: v });
              validateField("gsm", v);
            }}
          />

          <Input name="dept" label="Department:" placeholder="Enter department" />
        </div>
      </div>

      {/* Row 2 */}
      <div className="grid grid-cols-4 gap-6">
        <Input name="dob" label="Date of birth:" type="date" />
        <Input name="doa" label="Date of first appointment:" type="date" />
        <Input name="post" label="Post/grade of first appointment:" placeholder="Enter post" />
        <Input name="doc" label="Date of confirmation:" type="date" />
      </div>

      {/* Row 3 */}
      <div className="grid grid-cols-3 gap-6 w-full">
        <div className="flex flex-col">
          <label className="my-2 text-sm">Present post:</label>
          <select
            name="role"
            value={formdata.role || ""}
            onChange={handleChange}
            className="font-medium text-lg text-gray-500 py-3 px-6 outline-0 border rounded-sm focus:border-gray-400"
          >
            <option value="" disabled>Select a role</option>
            <option value="lecturer">Employee Academic</option>
            <option value="industrial-engineer">Employee Non-Academic (industrial/production engineer)</option>
            <option value="hod">Department Lead</option>
          </select>
          {errors.role && <p className="text-red-500 text-xs mt-1">{errors.role}</p>}
        </div>

        <Input name="dopp" label="Date appointed to present post:" type="date" />
        <Input name="level" label="Current level:" placeholder="Current level" />
      </div>

      {/* Qualifications */}
      <div className="w-full flex flex-col">
        <p className='text-sm text-pes my-3'>
          Academic & Professional Qualifications held:
          <span className="text-gray-300"> (certificates must be attached)</span>
        </p>

        <div className="flex flex-col bg-gray-50 rounded-xs p-4">
          <div className="flex flex-col justify-between m-2 w-[30%]">
            <input
              id="title"
              type="text"
              placeholder="Title or Qualification"
              name='qualification'
              value={formdata.qualification || ""}
              onChange={handleChange}
              className="font-medium text-sm text-gray-500 py-3 px-6 border rounded-sm "
            />

            <Input name='year' label='Year Obtained' type='date' classNameProp='w-[20%] ms-auto'/>
          </div>

          <div className="flex flex-col justify-between m-2">
            <label htmlFor="file" className="w-[30%] my-auto border">
              <div className="flex justify-end bg-white rounded-sm w-11/12 relative cursor-pointer">
                <p className="m-auto text-sm text-gray-300">{selectedFile != "" ? selectedFile : "No image selected"}</p>
                <div className="bg-gray-100 rounded-sm px-5 py-3 text-sm text-gray-500">Browse Files</div>
              </div>
              <input id="file" type="file" name='credential' className="hidden" onChange={handleFileUpload}/>
            </label>

          </div>
        </div>
      </div>
    </div>
  );
}
