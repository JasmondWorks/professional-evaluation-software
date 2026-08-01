"use client";
import { useEffect, useRef, useState } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import LoadingButton from "../../../../components/ui/LoadingButton";
import Link from "next/link";
import { apiFetch } from '@/app/utils/apiFetch';

type factored_type = {
  observed_time: number;
  estimated_time: number;
  normal_rating: number;
  performance_rating: number;
  contingency_allowance: number;
};

export default function Home() {
  const [newExtra, setNewExtra] = useState<JSX.Element[]>([]);
  const factored = {
    normal_rating: 0,
    performance_rating: 0,
    contingency_allowance: 0,
  };
  const [observed_time, setObserved_time] = useState([0, 0, 0]); // sumation,
  const [estimated_time, setEstimated_time] = useState([0, 0, 0]); // summation,
  const [factoredData, setFactoredData] = useState(factored);
  const formRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleDownload = async () => {
    setIsLoading(true);

    try {
      const response = await apiFetch(`/api/downloads/relax`);

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "relax");
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);

      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error  downloading file:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = async (event: { preventDefault: () => void }) => {
    event.preventDefault();
    const input = formRef.current;

    if (!input) {
      console.error("Form reference is null");
      return;
    }

    // Capture the form as canvas
    const canvas = await html2canvas(input);
    const imgData = canvas.toDataURL("image/png");

    // Create PDF document
    const pdf = new jsPDF("p", "pt", "a4");
    const imgWidth = 210 * 3.5; // Width of the PDF
    const pageHeight = 295 * 3.5; // Height of the PDF
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;

    let position = 0;

    // Add image to PDF
    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    // Add additional pages if necessary
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    // Save the PDF
    pdf.save("form.pdf");
  };

  function handleFactored(event: { target: { name: any; value: any } }) {
    setFactoredData((prev) => {
      return {
        ...prev,
        [event.target.name]: event.target.value,
      };
    });
    console.log("the change isFinite", factored);
  }

  interface ObservedEvent extends React.ChangeEvent<HTMLInputElement> {
    target: HTMLInputElement & { id: string; value: string };
  }

  function handleObserved(event: ObservedEvent) {
    setObserved_time((prev) => {
      const idx = Number(event.target.id);
      const value = Number(event.target.value);
      const updated = [...prev];
      updated[idx] = value;
      return updated;
    });
  }

  interface EstimatedEvent extends React.ChangeEvent<HTMLInputElement> {
    target: HTMLInputElement & { id: string; value: string };
  }

  function handleEstimated(event: EstimatedEvent): void {
    setEstimated_time((prev) => {
      const idx = Number(event.target.id);
      const value = Number(event.target.value);
      const updated = [...prev];
      updated[idx] = value;
      return updated;
    });
  }

  function handleTaskAdd(event: { preventDefault: () => void }) {
    event.preventDefault();
    let tempTask = (
      <div className="flex flex-wrap">
        <label htmlFor="" className="flex flex-col w-72">
          Position
          <input
            name=""
            required
            className="border m-1 px-16 py-2 rounded"
            type="text"
          />
        </label>

        <label htmlFor="" className="flex flex-col w-72">
          Busy
          <input
            name=""
            required
            className="border m-1 px-16 py-2 rounded"
            type="number"
          />
        </label>

        <label htmlFor="" className="flex flex-col w-72">
          Not busy
          <input
            name=""
            required
            className="border m-1 px-16 py-2 rounded"
            type="number"
          />
        </label>

        <label htmlFor="" className="flex flex-col w-72">
          Performance rating
          <input
            name=""
            required
            className="border m-1 px-16 py-2 rounded"
            type="number"
          />
        </label>
      </div>
    );

    setNewExtra((prev) => [...prev, tempTask]);
    setObserved_time((prev) => [...prev, (prev[prev.length] = 0)]);
    setEstimated_time((prev) => {
      console.log(prev.length);
      return [...prev, (prev[prev.length] = 0)];
    });
    console.log("times edited", observed_time, estimated_time);
  }

  useEffect(() => {}, [newExtra]);

  return (
    <form className="flex flex-col m-4">
      <div ref={formRef}>
        <h1 className="font-bold text-3xl my-6">Work sampling method</h1>

        <div className="flex flex-wrap">
          <label htmlFor="" className="flex flex-col w-72">
            Department
            <input
              name=""
              required
              className="border m-1 px-16 py-2 rounded"
              type="text"
            />
          </label>

          <label htmlFor="" className="flex flex-col w-72">
            Authorized by
            <input
              name=""
              required
              className="border m-1 px-16 py-2 rounded"
              type="text"
            />
          </label>

          <label htmlFor="" className="flex flex-col w-72">
            Analyst
            <input
              name=""
              required
              className="border m-1 px-16 py-2 rounded"
              type="text"
            />
          </label>

          <label htmlFor="" className="flex flex-col w-72">
            Date
            <input
              name=""
              required
              className="border m-1 px-16 py-2 rounded"
              type="date"
            />
          </label>
        </div>

        <hr className="border-dashed border-2 my-6" />

        <div className="flex flex-col">
          <div className="flex flex-wrap">
            <label htmlFor="" className="flex flex-col w-72">
              Position
              <input
                name=""
                required
                className="border m-1 px-16 py-2 rounded"
                type="text"
              />
            </label>

            <label htmlFor="" className="flex flex-col w-72">
              Busy
              <input
                name=""
                required
                className="border m-1 px-16 py-2 rounded"
                type="number"
              />
            </label>

            <label htmlFor="" className="flex flex-col w-72">
              Not busy
              <input
                name=""
                required
                className="border m-1 px-16 py-2 rounded"
                type="number"
              />
            </label>

            <label htmlFor="" className="flex flex-col w-72">
              Performance rating
              <input
                name=""
                required
                className="border m-1 px-16 py-2 rounded"
                type="number"
              />
            </label>
          </div>
        </div>

        {newExtra?.map((index: JSX.Element, key) => {
          return <div key={key}>{index}</div>;
        })}

        <hr className="border-dashed border-2 my-6" />

        <div className="flex flex-col">
          <div className="flex flex-wrap">
            <label htmlFor="" className="flex flex-col w-72">
              Desired relative accuracy (A)
              <input
                name=""
                required
                className="border m-1 px-16 py-2 rounded"
                type="text"
              />
            </label>

            <label htmlFor="" className="flex flex-col w-72">
              Standard deviations (K)
              <input
                name=""
                required
                className="border m-1 px-16 py-2 rounded"
                type="number"
              />
            </label>

            <label htmlFor="" className="flex flex-col w-72">
              Available annual hours
              <input
                name=""
                required
                className="border m-1 px-16 py-2 rounded"
                type="number"
              />
            </label>

            <label htmlFor="" className="flex flex-col w-72">
              Use factor
              <input
                name=""
                required
                className="border m-1 px-16 py-2 rounded"
                type="number"
              />
            </label>

            <label htmlFor="" className="flex flex-col w-72">
              Performance rating
              <input
                name=""
                required
                className="border m-1 px-16 py-2 rounded"
                type="number"
              />
            </label>
          </div>
        </div>
      </div>

      <div className="flex">
        <button
          className="bg-pes w-fit my-3 me-2 rounded text-white px-16 py-3"
          type="submit"
        >
          Evaluate
        </button>
        <LoadingButton
          className="bg-pes w-fit my-3 me-2 rounded text-white px-16 py-3"
          onClick={handleTaskAdd}
        >
          Add Position
        </LoadingButton>
        <Link
          href="/downloadables/work-sample-study.pdf"
          className="bg-pes w-fit me-4 rounded text-white px-16 py-3"
        >
          Print form for survey
        </Link>
        <Link
          href="/downloadables/relax.pdf"
          className="bg-pes w-fit my-3 me-2 rounded text-white px-16 py-3"
        >
          relaxation guide
        </Link>
        <Link
          href="staff/sampling/generate"
          className="bg-pes w-fit my-3 me-2 rounded text-white px-16 py-3"
        >
          Generate random study day/hours
        </Link>
      </div>
    </form>
  );
}
