import React, { useState, useRef, useEffect } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Toast } from "primereact/toast";
import { Dialog } from "primereact/dialog";
import { MultiSelect } from "primereact/multiselect";
import axios from "axios";
import FileDownload from "react-file-download";

const MicroTask = ({
  projectId,
  activityId,
  phaseId,
  selectedIcon,
  onClose,
}) => {
  const toast = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [subtasks, setSubtasks] = useState([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [microTaskAvailable, setMicroTaskAvailable] = useState(false);
  const [selectedMicroTasks, setSelectedMicroTasks] = useState([]);
  // Move this effect to handle selectedIcon changes
  useEffect(() => {
    if (selectedIcon === "add") {
      setIsEditModalOpen(true);
    } else if (selectedIcon === "view") {
      setIsViewModalOpen(true);
      fetchSubtasks(projectId, phaseId, activityId);
    }
  }, [projectId, phaseId, activityId, selectedIcon]);

  const onSuccess = (success) => {
    if (success) {
      toast.current?.show({
        severity: "success",
        summary: "Successfully",
        detail: `${success}`,
        life: 3000,
      });
    }
  };

  const onError = (error) => {
    if (error) {
      toast.current?.show({
        severity: "error",
        summary: "Error occurred",
        detail: `${error}`,
        life: 3000,
      });
    }
  };

  const onWarn = (error) => {
    if (error) {
      toast.current?.show({
        severity: "warn",
        summary: "Please upload micro task(s)",
        detail: `${error}`,
        life: 3000,
      });
    }
  };

  const handleSaveEditChanges = () => {
    if (!selectedFile) {
      onError("Please select a file to upload.");
      return;
    }
    const formData = new FormData();
    formData.append("excel_file", selectedFile);
    axios
      .post("http://agilepm.eliaskemboy.com/api/create_tasks", formData, {
        params: {
          projectId: projectId,
          phaseId: phaseId,
          phaseActivityId: activityId,
        },
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((response) => {
        if (response.status === 200) {
          onSuccess(response.data.message);
          setIsEditModalOpen(false);
          setIsViewModalOpen(true);
        }
      })
      .catch((error) => {
        onError("Error uploading file:");
        console.error("Error uploading file:", error);
      });
  };

  const handleDownloadTemplate = async () => {
    try {
      const response = await axios.get(
        "http://agilepm.eliaskemboy.com/api/download-excel-tasks",
        {
          responseType: "blob",
        }
      );
      FileDownload(response.data, "Project_Micro-Task_Template.xlsx");
    } catch (error) {
      onError("Error downloading Excel file");
    }
  };

  const handleUploadExcel = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
  };

  const handleTaskSelection = (rowData) => {
    setSelectedMicroTasks((prevTasks) => {
      const updatedTasks = prevTasks.map((task) =>
        task.id === rowData.id ? { ...task, selected: !task.selected } : task
      );
      return updatedTasks;
    });
  };

  // effect to fetch subtasks

  const fetchSubtasks = (projectId, phaseId, activityId) => {
    axios
      .get(
        `http://agilepm.eliaskemboy.com/api/getSubtasks/${projectId}/${phaseId}/${activityId}`
      )
      .then((response) => {
        setSubtasks(response.data.data);
        onSuccess("Successfully fetched Micro tasks");
      })
      .catch((error) => {
        if (error.response && error.response.status === 404) {
          onWarn(error.response.data.message);
        } else {
          onError("Error getting subtasks");
        }
        setMicroTaskAvailable(false);
      });
  };

  console.log(subtasks);

  const handleDownloadMicroTaskData = () => {
    axios.get("");
  };

  return (
    <div>
      <Toast ref={toast} position="top-center" />
      <div className="flex justify-content-center">
        <Dialog
          header={"Edit Micro Task"}
          visible={isEditModalOpen}
          onHide={() => setIsEditModalOpen(false)}
          style={{ width: "80vw" }}
        >
          <div className="mb-4">
            <div className="flex w-full justify-between mb-4">
              <button
                className="px-4 py-2 bg-blue-500 text-white rounded-md focus:outline-none focus:shadow-outline mt-4"
                onClick={handleDownloadTemplate}
              >
                Download Template
              </button>
              <button className="px-4 py-2 bg-blue-500 text-white rounded-md focus:outline-none focus:shadow-outline mt-4">
                Upload Data
              </button>
              <button
                className="px-4 py-2 bg-blue-500 text-white rounded-md focus:outline-none focus:shadow-outline mt-4"
                onClick={handleDownloadMicroTaskData}
              >
                Micro Task Data
              </button>
            </div>
            <div>
              <div className="mb-4">
                <div className="flex items-start mb-2">
                  <input
                    type="file"
                    accept=".xlsx, .xls"
                    onChange={handleUploadExcel}
                    className="hidden"
                    id="micro-task"
                    name="micra-task"
                  />
                  <label
                    htmlFor="micro-task"
                    className="cursor-pointer bg-gray-100 px-3 py-2 rounded-md border border-gray-300 hover:bg-gray-200 focus:bg-gray-200 flex items-center"
                  >
                    {selectedFile
                      ? selectedFile.name // Display the file name
                      : "Choose a filled Excel file"}
                  </label>
                </div>
                <div className="flex space-x-2 justify-between">
                  <button
                    className="px-4 py-2 bg-blue-500 text-white rounded-md"
                    onClick={handleSaveEditChanges}
                  >
                    Save
                  </button>
                  <button
                    className="px-4 py-2 bg-red-500 text-white rounded-md"
                    onClick={() => setIsEditModalOpen(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Dialog>

        {/* View Modal */}
        <Dialog
          visible={isViewModalOpen}
          onHide={() => setIsViewModalOpen(false)}
          style={{ width: "80vw" }}
        >
          <DataTable value={subtasks}>
            <Column
              field="task"
              header="Task Name"
              sortable
              filter
              filterPlaceholder="Search by task name"
            ></Column>
            <Column
              field="description"
              header="Task Description"
            ></Column>
            <Column field="start_date" header="Start Date" sortable></Column>
            <Column field="end_date" header="End Date" sortable></Column>
            <Column
              field="department"
              header="Department"
              sortable
              filter
              filterPlaceholder="Search by department"
            ></Column>
            <Column
              field="assigned_to"
              header="Assigned To"
              sortable
              filter
              filterPlaceholder="Search by assigned to"
            ></Column>
            <Column
              field="status"
              header="Status"
              sortable
              filter
              filterElement={
                <MultiSelect
                  value={selectedMicroTasks.map((task) => task.status)}
                  options={["pending", "completed"]} // Your status options here
                  onChange={(e) =>
                    setSelectedMicroTasks(
                      subtasks.filter((task) => e.value.includes(task.status))
                    )
                  }
                  placeholder="Filter by status"
                />
              }
              filterPlaceholder="Search by status"
            ></Column>
          </DataTable>
          <div className="flex justify-between">
            <button
              className="px-4 py-2 bg-blue-500 text-white rounded-md focus:outline-none focus:shadow-outline mt-4"
              onClick={onClose}
            >
              Push to sprint
            </button>
            <button
              className="px-4 py-2 bg-red-500 text-white rounded-md focus:outline-none focus:shadow-outline mt-4"
              onClick={() => setIsViewModalOpen(false)}
            >
              Cancel
            </button>
          </div>
        </Dialog>
      </div>
    </div>
  );
};

export default MicroTask;
