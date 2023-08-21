import React, { useRef, useState } from "react";
import { Button } from "primereact/button";
import { Calendar } from "primereact/calendar";
import axios from "axios";
import { Toast } from "primereact/toast";

const CreateSprint = ({ rerouting }) => {
  const [sprintData, setSprintData] = useState({
    name: "",
    start_date: null,
    end_date: null,
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
        "https://agile-pm.agilebiz.co.ke/api/create_sprint",
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
      if (error && error.response && error.response.data) {
        if (error.response.data.message) {
          onError(error.response.data.message);
        }

        if (error.response.data.errors) {
          setValidError(error.response.data.errors);
        }
      } else {
        onError("An unexpected error has occurred");
      }
    }
  };

  const handleCancel = () => {
    setSprintData({
      name: "",
      start_date: null,
      end_date: null,
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
    <div>
      <Toast ref={toast} />
      <div
        className="w-full"
        style={{ overflowY: "auto", maxHeight: "calc(100vh - 200px)" }}
      >
        <form
          onSubmit={handleSubmit}
          className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 max-w-sm mx-auto"
        >
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
          <Calendar
            id="start_date"
            name="start_date"
            value={sprintData.start_date}
            onChange={(e) =>
              handleChange({ target: { name: "start_date", value: e.value } })
            }
            required
            showIcon
            className="w-full"
          />
          {displayError("start_date")}

          <label htmlFor="end_date" className="block font-semibold">
            End Date:
          </label>
          <Calendar
            id="end_date"
            name="end_date"
            value={sprintData.end_date}
            onChange={(e) =>
              handleChange({ target: { name: "end_date", value: e.value } })
            }
            required
            showIcon
            className="w-full"
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
    </div>
  );
};

export default CreateSprint;
