'use client'
import { useEffect, useState } from "react"
import jwt, { JwtPayload } from "jsonwebtoken";
import LoadingButton from '../../components/ui/LoadingButton';

export default function Home(){
    const [toolView, setToolView] = useState(false)
    const [dialog, setDialog] = useState(false)
    const [message, setMessage] = useState("")
    const [status, setStatus] = useState(true)
    const [tools, setTools] = useState([])
    const [facility, setFacility] = useState({
        description: "",
        symbol: "",
        location: "",
        id: "",
        type: "",
        rating: 0,
        remark: "",
    })

    function handleChange(event: { preventDefault: () => void; target: { name: any; value: any } }) {
        event.preventDefault()
        setFacility( (prev) => {
            return { ...prev, [event.target.name]: event.target.value} 
        })
    }

    async function addFacility(event: { preventDefault: () => void; }) {
        event.preventDefault()
        const access_token = localStorage.getItem("access_token");
        const decoded: any = jwt.decode(access_token as string);
        
        try {
            const req = await fetch("/api/addFacility", {
                method: "POST",
                headers : {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({data: facility, org: decoded.org})
            })  
            const res = await req.json()
            setMessage( res.message )
            setDialog( prev => !prev )
            setToolView( prev => !prev )

            if (res.status == 200) {
                setStatus(true)
            } else {
                setStatus(false)                
            }
                      
        } catch (error) {
            console.error(error)
        }

    }

    useEffect(()=>{
        async function fetchTools(){
            const access_token = localStorage.getItem('access_token') as any
            const tokenData = jwt.decode(access_token)
            console.log(tokenData);
            

            try {
                const req = await fetch("/api/getFacility", {
                    method: "POST",
                    headers : {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ org: typeof tokenData === 'object' && tokenData !== null && 'org' in tokenData ? (tokenData as JwtPayload).org : undefined })
                })
                const res = await req.json()
                console.log(res);
                
                setTools( res )
                          
            } catch (error) {
                console.error(error)
            }
    
        }

        fetchTools()
    }, [])

    return (
        <div className="p-8 relative">
            <div style={{ display: toolView? '': 'none' }} className="absolute z-10 mx-auto bg-white p-8 rounded-lg shadow-lg w-full max-w-4xl">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold">Add Tools Or Facilities (Inventory)</h2>
                    <div onClick={ () => setToolView( prev => !prev ) }  className="cursor-pointer">X</div>
                </div>
                <form className="space-y-4" onSubmit={ addFacility }>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-gray-700">Description of Facility:</label>
                            <input onChange={ handleChange } name="description" type="text" placeholder="Enter the description of the facility" className="w-full p-2 border border-gray-300 rounded"/>
                        </div>
                        <div>
                            <label className="block text-gray-700">Identification Symbol:</label>
                            <input onChange={ handleChange } name="symbol" type="text" placeholder="Enter the ID symbol of the facility" className="w-full p-2 border border-gray-300 rounded"/>
                        </div>
                        <div>
                            <label className="block text-gray-700">Location:</label>
                            <input onChange={ handleChange } name="location" type="text" placeholder="Enter the location of the facility" className="w-full p-2 border border-gray-300 rounded"/>
                        </div>
                        <div>
                            <label className="block text-gray-700">Facility Register ID Number:</label>
                            <input onChange={ handleChange } name="id" type="text" placeholder="Enter the Facility Register ID Number" className="w-full p-2 border border-gray-300 rounded"/>
                        </div>
                        <div>
                            <label className="block text-gray-700">Type:</label>
                            <input onChange={ handleChange } name="type" type="text" placeholder="Enter the Facility Type" className="w-full p-2 border border-gray-300 rounded"/>
                        </div>
                        <div>
                            <label className="block text-gray-700">Priority Rating: <a href="#" className="text-blue-600">what does this mean?</a></label>
                            <select onChange={ handleChange } name="rating" className="w-full p-2 border border-gray-300 rounded">
                                <option>Select the priority rating</option>
                                <option>10</option>
                                <option>20</option>
                                <option>30</option>
                                <option>40</option>
                                <option>50</option>
                                <option>60</option>
                                <option>70</option>
                                <option>80</option>
                                <option>90</option>
                                <option>100</option>
                            </select>
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-gray-700">Remarks:</label>
                            <input onChange={ handleChange } name="remark" type="text" placeholder="Enter remarks" className="w-full p-2 border border-gray-300 rounded"/>
                        </div>
                    </div>
                    <div className="flex justify-center mt-6">
                        <button type="submit" className="bg-blue-900 text-white px-6 py-2 rounded">Save Changes</button>
                    </div>
                </form>
            </div>

            <div style={{ display: dialog? '': 'none' }} className={`absolute z-10 mx-auto bg-white p-8 rounded-lg shadow-lg w-full max-w-4xl text-${ status? 'green': 'red' }-700`}>
                <p>{ message }</p>
                <button className={`p-2 rounded bg-${ status? 'green': 'red' }-700 text-white`}>Ok</button>
            </div>

            <h1 className="text-2xl font-semibold mb-4">Tools & Facilities</h1>
            <div className="flex items-center mb-4">
                <div className="relative flex-grow">
                    <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                    <input 
                        type="text" 
                        placeholder="Search any tool or facility" 
                        className="pl-10 pr-4 py-2 border rounded w-full"
                    />
                </div>
                <LoadingButton onClick={ () => setToolView( prev => !prev ) } className="ml-4 px-4 py-2 bg-white border border-pes text-pes rounded">
                </LoadingButton>
                <a href="/maintenance/inventory" className="ml-4 px-4 py-2 bg-blue-900 text-white rounded">
                    View Inventory Sheet
                </a>
            </div>

            <div className="space-y-2">
                {/* <a href={ `maintenance/Electric Motor` } className="flex justify-between items-center p-4 bg-gray-100 rounded">
                    <span>Electric Motor</span>
                </a>
                <a href={ `maintenance/Diesel Engine` } className="flex justify-between items-center p-4 bg-gray-100 rounded">
                    <span>Diesel Engine</span>
                </a> */}
                {
                    tools.map((index, key) => {
                        return(
                            <a key={key} href={ `maintenance/${index}` } className="flex justify-between items-center p-4 bg-gray-100 rounded">
                                <span>{ index }</span>
                            </a>
                        )
                    })
                }
            </div>
        </div>
    )
}