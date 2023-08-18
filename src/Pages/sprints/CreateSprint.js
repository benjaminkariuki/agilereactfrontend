import React, { useRef, useState } from "react";
import { Button } from "primereact/button";
import axios from "axios";
import { Toast } from "primereact/toast";

const CreateSprint = ({ rerouting }) => {
  const [sprintData, setSprintData] = useState({
    name: "",
    start_date: "",
    end_date: "",
  });
  const toast = useRef(null);
  const [validError, setValidError] = useState({});

  const onSuccess = (success) => {
    toast.current.show({
      severity: "success",
      summary: "Successful",
      detail: `${success}`,
      life: 1000,
    });
  };

  const onError = (error) => {
    toast.current.show({
      severity: "error",
      summary: "An Error encountered",
      detail: `${error}`,
      life: 3000,
    });
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setSprintData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const response = await axios.post(
        "http://192.168.88.150:8000/api/create_sprint",
        {
          name: sprintData.name,
          start_date: sprintData.start_date,
          end_date: sprintData.end_date,
        }
      );

      if (response.status === 200) {
        onSuccess(response.data.message);
        setTimeout(() => {
          setValidError({});
          rerouting();
        }, 1000);
      }
    } catch (error) {
      //check if error and response object exist
      if (error && error.response && error.response.data) {
        if (error.response.data.message) {
          onError(error.response.data.message);
        }

        if (error.response.data.errors) {
          setValidError(error.response.data.errors);
        }
      } else {
        //add a general error message
        onError("An unexpected error has occurred");
      }
    }
  };

  const handleCancel = () => {
    setSprintData({
      name: "",
      start_date: "",
      end_date: "",
    });
    setValidError({});
    rerouting();
  };

  const displayError = (field) => {
    if (validError[field]) {
      return <p className="text-red-500">{validError[field][0]}</p>;
    }
    return null;
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <Toast ref={toast} />
      <form onSubmit={handleSubmit} className="space-y-4">
        <label htmlFor="name" className="block font-semibold">
          Name:
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={sprintData.name}
          onChange={handleChange}
          required
          className="block w-full p-2 border rounded focus:outline-none focus:border-primary"
        />
        {displayError("name")}

        <label htmlFor="start_date" className="block font-semibold">
          Start Date:
        </label>
        <input
          type="date"
          id="start_date"
          name="start_date"
          value={sprintData.start_date}
          onChange={handleChange}
          required
          className="block w-full p-2 border rounded focus:outline-none focus:border-primary"
        />
        {displayError("start_date")}

        <label htmlFor="end_date" className="block font-semibold">
          End Date:
        </label>
        <input
          type="date"
          id="end_date"
          name="end_date"
          value={sprintData.end_date}
          onChange={handleChange}
          required
          className="block w-full p-2 border rounded focus:outline-none focus:border-primary"
        />
        {displayError("end_date")}

        <Button type="submit" label="Submit" className="p-button-success" />
        <Button
          type="button"
          label="Cancel"
          onClick={handleCancel}
          className="p-button-secondary"
        />
      </form>
    </div>
  );
};

export default CreateSprint;
