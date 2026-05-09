'use client'
import { ArrowRight, Category  } from 'iconsax-react';
import { FormEvent, useState, useEffect, ChangeEvent } from "react";
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

let slider_index = 0

const first = (
  <>
    <h1 className='text-3xl text-semibold my-2 w-10/12'>
      {`Your Company's journey`} <br/> {`towards`} <span className='text-yellow-400'>Enhanced <br/> Performance</span> {`starts today`}
    </h1>
    <p className='text-sm'>
      {`PES is your company's tool for optimizing team performance. Discover a suite of tools tailored to enhance collaboration and achieve organizational goals`}
    </p>
  </>)

const second = (
  <>
    <h1 className='text-3xl text-semibold my-2 w-10/12'>
      Customize You Metrics
    </h1>
    <p className='text-sm'>
      {`Craft performance metrics that align with your company's objectives. Our intuitive interface allows you to define goals that resonate with your team's roles and aspirations.`}
    </p>
  </>
)

const third = <></>

const PLAN_CODES = {
  basic: 'PLN_w4hf2tk7k3mu66a',
  standard: 'PLN_pl6nmfsedqvm0oa',
  premium: 'PLN_bquiv8u3t2otwuh',
};

type PlanType = keyof typeof PLAN_CODES;

// Utility for safely resolving plan codes
const resolvePlanCode = (plan: string) => PLAN_CODES[plan as PlanType] ?? PLAN_CODES.basic;

export default function Home() {
  const slider_arr = [ true, false, false ]
  const content_arr = [ first, second, third ]
  const [ slide, setSlide ] = useState(slider_arr)
  const router = useRouter()
  const searchParams = useSearchParams();
  const productCategory = searchParams.get('product_category') as string;
  const planType = searchParams.get('product_plan') as string;
  
  console.log(planType, productCategory)
  // --- React state ---
  const [message, setMessage] = useState({
    visibility: 'invisible',
    text: '',
    color: '',
  });

  const [formData, setFormData] = useState({
    name: '',
    org: '',
    email: '',
    password: '',
    confirmPassword: '', // Added for proper binding
    category: productCategory, // Will update in useEffect
    plan: planType,     // Will update in useEffect
    planCode: '', // Will update in useEffect
    logo: '',
    agree: false  // Added for proper binding
  });

  // Sync params to state when they become available
  useEffect(() => {
    if (productCategory && planType) {
      setFormData(prev => ({
        ...prev,
        category: productCategory,
        plan: planType,
        planCode: resolvePlanCode(planType)
      }));
    } else {
      // Optional: Redirect if params are strictly required
      // router.replace("/forbidden");
    }
  }, [productCategory, planType]);

  const allFieldsFilled =
    formData.name.trim() !== '' &&
    formData.org.trim() !== '' &&
    formData.email.trim() !== '' &&
    formData.password.trim() !== '' &&
    // formData.logo?.trim() !== '' &&
    // formData.logo?.trim() !== ''&&
    formData.confirmPassword.trim() !== '' &&
    formData.agree === true;

  async function handleImageUpload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", "pes_unsigned"); // change this to env if needed
    data.append("folder", "pes/logo");

    try {
      const cloudRes = await fetch(
        "https://api.cloudinary.com/v1_1/duvqe45ds/image/upload",
        {
          method: "POST",
          body: data
        }
      );
      const uploaded = await cloudRes.json();

      setFormData(prev => ({
        ...prev,
        logo: uploaded.secure_url
      }));
    } catch (err) {
      console.log(err);
    }
  }

  const switchSlide = () => {
    slider_index++;
    for (let i = 0; i < slider_arr.length; i++) {
      slider_arr[i] = i === slider_index % 3;
    }
    setSlide([...slider_arr]);
  };

  // Improved handleChange to handle checkboxes and standard inputs
  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const { name, value, type, checked } = event.target;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  }
  
  async function signup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage({ visibility: 'visible', text: 'Signing up, Please wait...', color: 'green' })
  
    // Pre-validation
    if (formData.password !== formData.confirmPassword) {
        setMessage({ visibility: 'visible', text: "Passwords do not match", color: 'red' });
        return;
    }

    try {
      const req = await fetch('/api/signup', {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      })
      
      // Check HTTP status code
      if (!req.ok) {
        const errorData = await req.json().catch(() => ({})); 
        const errorMessage = errorData.message || errorData.error || `Error: ${req.status} ${req.statusText}`;
        throw new Error(errorMessage);
      }

      const res = await req.json()
  
      console.log('token before storage:', res.token )
      localStorage.setItem('access_token', res.token );
      router.push('/dashboard')

    } catch (error) {
      console.log(error)
      let errorMsg = 'An unexpected error occurred';
      if (error instanceof Error) {
        if (error.message.includes('already exists') || error.message.includes('unique constraint')) {
            errorMsg = "This email is already registered.";
        } else {
            errorMsg = error.message;
        }
      }
      setMessage({ visibility: 'visible', text: errorMsg , color: 'red' })
    }
  }

  return(
    <main className="w-full flex h-screen relative">
      <div style={{ borderColor: message.color, borderInlineWidth: '6px', borderBlockWidth: '1px' }} className={ `z-10 bg-white absolute p-6 px-12 shadow-md rounded-md text-gray-600 font-semibold ${message.visibility} top-3 left-1/2 -translate-x-1/2` }>
        {message.text}
      </div>

      <div className="scroller w-3/12 absolute bottom-4 left-3/12 z-10 flex justify-between">
        <div className="page my-auto flex">
          {          
            slide.map( (i, key) => <div key={ key } className= {`ircle h-2 ${ i ? 'w-6 bg-pes' : 'w-2 bg-gray-200'} rounded-full mx-1_2 transition-all`}></div> )
          }
        </div>

        <div className="slider bg-pes p-3 me-4 rounded-full text-white" onClick={ () => switchSlide() }>
          <ArrowRight />
        </div>
      </div>

      <div className="illustration2 bg-white flex flex-col justify-center w-1/2 py-6 px-28 h-screen relative ">
        <div className = 'my-2 text-pes text-3xl font-extrabold flex'>
          <Image src={'/Vector.svg'} alt='PES' width={55} height={55} />
          <p className = 'ms-2 my-auto'>PES</p>
        </div>
      
        <div className="carousel w-full h-48 text-left relative">
          {
            slide.map((i, key) => (
              <div key={key} className={`${ i ? "opacity-100" : "opacity-0" } transition-opacity duration-500 absolute top-0 left-0`}>
                { content_arr[key] }
              </div>
            ))
          }
        </div>

        <div className='relative h-80 w-80 flex overflow-hidden mx-auto'>
          {
            slide.map((i, key) => (
              <Image
                key={key}
                src={`/image${key + 1}.png`}
                width={ 320 } height={ 320 }
                alt={`slide${key + 1}`}
                className={`carousel-image absolute top-0 left-0 object-cover ${ i ? "opacity-100" : "opacity-0" } transition-opacity duration-500`}
              />
            ))
          }
        </div>
      </div>

      <form onSubmit={ signup } className="overflow-y-scroll form w-1/2 h-full flex flex-col pt-52 pb-14 px-28 justify-center">
        <p className='text-3xl text-extrabold'>Create your Account</p>
        <p className='text-sm mb-8'>{`Enter your details and let's get started`}</p>

        <div className="input flex flex-col justify-center mb-4">
          <label htmlFor="name" className='mb-1 font-bold text-sm'>Admin Name:</label>
          <input required onChange={handleChange} value={formData.name} className='bg-transparent border border-gray-200 text-black placeholder:text-gray-300 text-sm focus:outline-pes ps-4 py-3 rounded-md' type="text" name="name" id="name" placeholder='Enter your Institution or company name'/>
        </div>

        <div className="input flex flex-col justify-center mb-4">
          <label htmlFor="org" className='mb-1 font-bold text-sm'>Organization Name:</label>
          <input required onChange={handleChange} value={formData.org} className='bg-transparent border border-gray-200 text-black placeholder:text-gray-300 text-sm focus:outline-pes ps-4 py-3 rounded-md' type="text" name="org" id="org" placeholder='Enter your Institution or company name'/>
        </div>

        <div className="input flex flex-col justify-center mb-4">
          <label htmlFor="email" className='mb-1 font-bold text-sm'>Email Address:</label>
          <input required onChange={handleChange} value={formData.email} className='bg-transparent border border-gray-200 text-black placeholder:text-gray-300 text-sm focus:outline-pes ps-4 py-3 rounded-md' type="email" name="email" id="email" placeholder='Enter your Institution or company email'/>
        </div>

        <div className="input flex flex-col justify-center mb-4">
          <label htmlFor="password" className='mb-1 font-bold text-sm'>Password:</label>
          <input required onChange={handleChange} value={formData.password} className='bg-transparent border border-gray-200 text-gray-700 placeholder:text-gray-300 text-sm focus:outline-pes ps-4 py-3 rounded-md' type="password" name="password" id="password" placeholder='Enter your Password'/>
        </div>

        <div className="input flex flex-col justify-center mb-4">
          <label htmlFor="confirmPassword" className='mb-1 font-bold text-sm'>Confirm Password:</label>
          <input
            required
            onChange={handleChange}
            value={formData.confirmPassword}
            type="password"
            name="confirmPassword"
            id="confirmPassword"
            className='bg-transparent border border-gray-200 text-gray-700 placeholder:text-gray-300 text-sm focus:outline-pes ps-4 py-3 rounded-md'
            placeholder="Confirm your Password"
          />
        </div>

        <div className="flex flex-row justify-start mb-8">
          <div className='flex'>
            <input required onChange={handleChange} type="checkbox" name="agree" id="agree"/>
            <label htmlFor='agree' className='mx-4 text-sm'>I accept all <span className='font-bold'>terms and conditions</span></label>
          </div>
        </div>

        <div className="input flex flex-col justify-center mb-4">
          <label htmlFor="logo" className='mb-1 font-bold text-sm'>Institution Logo:</label>
          <input required 
            type="file" 
            accept="image/*"
            onChange={handleImageUpload}
            className="text-sm text-gray-400"
          />

          {formData.logo && (
            <Image 
              src={formData.logo} 
              alt="Logo preview" 
              width={80} 
              height={80} 
              className="mt-3 rounded-md border border-gray-300"
            />
          )}
        </div>
        
        <p className={`text-sm ${ allFieldsFilled? 'text-green-700' : "text-red-700"}`}>*All fields are required to proceed.</p>
        <input
          disabled={!allFieldsFilled}
          type='submit' 
          value={'Sign up'} 
          className={`btn px-4 py-3 rounded-lg mb-2 text-white
            ${allFieldsFilled ? "bg-pes hover:bg-[#141444] cursor-pointer" : "bg-gray-400 cursor-not-allowed"}
          `}
        />

        {/* <pre>{JSON.stringify(formData, null, 2)}</pre> */}
        <p className='text-center'>{`Have an Account?`} <Link className='text-pes' href={'/login'}>Sign In</Link> </p>
      </form>
    </main>     
  )
}