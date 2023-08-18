import React, { useState, useRef, useEffect } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Toast } from "primereact/toast";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { Tag } from "primereact/tag";
import axios from "axios";
import { Calendar } from "primereact/calendar";
import FileDownload from "react-file-download";
import { MultiSelect } from "primereact/multiselect";
import { Editor } from "primereact/editor";
import { Card } from "primereact/card";
import { AiFillEdit } from "react-icons/ai";
import { RiDeleteBin5Fill } from "react-icons/ri";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { FilterMatchMode, FilterOperator } from "primereact/api";

const MicroTask = ({
  projectId,
  activityId,
  phaseId,
  selectedIcon,
  projectManagers,
  businessAnalysts,
  teamLeads,
  developers,
}) => {
  const baseUrl = "http://192.168.88.150:8000/storage/";
  const toast = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [subtasks, setSubtasks] = useState([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedMicroTasks, setSelectedMicroTasks] = useState([]);
  const [filters, setFilters] = useState(null);
  const [statuses] = useState(["pending", "completed", "highpriority"]);
  const [loading, setIsLoading] = useState(false);
  const [pustLoading, setPushLoading] = useState(false);
  const [taskcreate, setTaskCreate] = useState(false);
  const [departments] = useState([
    "Porfolio Managers Department",
    "Web Department",
    "Business Central Department",
    "Infrastructure Department",
    "Business Analyst Department",
    "Implementation Department",
  ]);
  const [createTaskDialogVisible, setCreateTaskDialogVisible] = useState(false);
  const [newTask, setNewTask] = useState({
    task: "",
    department: "",
    description: "",
    start_date: null,
    end_date: null,
    assigneBa: [],
  });

  const [editingTask, setEditingTask] = useState({
    id: null,
    task: "",
    description: "",
    department: "",
    start_date: null,
    end_date: null,
    assigned_to: [],
    assigneBa: [],
  });
  const [isEditTaskModalOpen, setIsEditTaskModalOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [projectUsers, setProjectUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  // const [wasTo, setWasAssignedTo] = useState([]);
  // Move this effect to handle selectedIcon changes
  useEffect(() => {
    if (selectedIcon === "add") {
      setIsEditModalOpen(true);
    } else if (selectedIcon === "view") {
      setIsViewModalOpen(true);
      fetchSubtasks(projectId, phaseId, activityId);
    }
    setProjectUsers(
      businessAnalysts
        .concat(teamLeads)
        .concat(developers)
        .concat(projectManagers)
    );
    initFilters();
  }, [
    projectId,
    phaseId,
    activityId,
    selectedIcon,
    projectManagers,
    businessAnalysts,
    teamLeads,
    developers,
  ]);

  const getSeverity = (status) => {
    switch (status) {
      case "highpriority":
        return "danger";

      case "completed":
        return "success";

      case "pending":
        return "warning";
      default:
        return null;
    }
  };

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
  const onInfo = (info) => {
    if (info) {
      toast.current?.show({
        severity: "info",
        summary: "Successfull",
        detail: `${info}`,
        life: 3000,
      });
    }
  };

  const initFilters = () => {
    setFilters({
      status: {
        operator: FilterOperator.OR,
        constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }],
      },
      task: {
        operator: FilterOperator.AND,
        constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }],
      },
      assigned_to: {
        operator: FilterOperator.AND,
        constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }],
      },
    });
  };

  const confirmDelete = (id) => {
    confirmDialog({
      message: "Do you want to delete this record?",
      header: "Delete Confirmation",
      icon: "pi pi-info-circle",
      acceptClassName: "p-button-danger",
      accept: () => handleMicroTaskDelete(id),
    });
  };

  const statusBodyTemplate = (rowData) => {
    const severity = getSeverity(rowData.status);
    return severity ? (
      <Tag value={rowData.status} className={`p-tag-${severity}`} />
    ) : (
      rowData.status
    );
  };

  const statusFilterTemplate = (options) => {
    return (
      <Dropdown
        value={options.value}
        options={statuses}
        onChange={(e) => options.filterCallback(e.value)}
        placeholder="Select Status"
        className="p-column-filter"
      />
    );
  };

  const handleSaveEditChanges = () => {
    if (!selectedFile) {
      onError("Please select a file to upload.");
      return;
    }
    setIsLoading(true);
    const formData = new FormData();
    formData.append("excel_file", selectedFile);
    axios
      .post("http://192.168.88.150:8000/api/create_tasks", formData, {
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
        onSuccess(response.data.message);
        setIsEditModalOpen(false);
        setSelectedFile(null);
        setIsLoading(false);
      })
      .catch((error) => {
        onError("Error uploading file:");
        console.error("Error uploading file:", error);
        setIsLoading(false);
      });
  };

  const handleDownloadTemplate = () => {
    axios
      .get("http://192.168.88.150:8000/api/download-excel-tasks", {
        responseType: "blob",
      })
      .then((response) => {
        FileDownload(response.data, "Project_Micro-Task_Template.xlsx");
      })

      .catch((error) => {
        onError("Error downloading Excel file");
      });
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
    const sDate = new Date(rowData.start_date);
    const eDate = new Date(rowData.end_date);
    const assignedUsers = rowData.assigned_to.map((user) => user.email);
    // const ba = rowData.assigneBa.map((user) => user.email);
    console.log(rowData);
    setEditingTask({
      id: rowData.id,
      task: rowData.task,
      description: rowData.description,
      department: rowData.department,
      start_date: sDate,
      end_date: eDate,
      assigned_to: assignedUsers,
      assigneBa: editingTask.assigneBa,
    }); // Store the task details to be edited
    setIsEditTaskModalOpen(true); // Open the edit modal
  };

  const handleCloseEditModal = () => {
    setIsEditTaskModalOpen(false);
    setEditingTask({
      id: null,
      task: "",
      description: "",
      department: "",
      start_date: null,
      end_date: null,
      assigned_to: [],
      assigneBa: [],
    });
    setEditLoading(false);
    setSelectedUsers([]);
  };
  const handleMicroTaskDelete = (id) => {
    axios
      .delete(`http://192.168.88.150:8000/api/deleteSubtask/${id}`, {
        params: {
          projectId: projectId,
          phaseId: phaseId,
          phaseActivityId: activityId,
        },
      })
      .then((response) => {
        onInfo(response.data.message);
        fetchSubtasks(projectId, phaseId, activityId);
      })
      .catch((error) => {
        onError(error.response.message);
      });
  };

  // effect to fetch subtasks
  const fetchSubtasks = (projectId, phaseId, activityId) => {
    axios
      .get(
        `http://192.168.88.150:8000/api/getSubtasks/${projectId}/${phaseId}/${activityId}`
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
      });
  };

  const handleDownloadMicroTaskData = () => {
    axios.get("");
  };

  const handlePushtoSprint = () => {
    setPushLoading(true);
    // if (!selectedMicroTasks) {
    //   setPushLoading(false);
    //   return;
    // }
  };

  // New state for the create task form

  const formatDate = (date) => {
    if (!date) return ""; // Return an empty string if the date is not provided
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };
  // New function to handle form submission
  const handleCreateTask = () => {
    setTaskCreate(true);

    axios
      .post("http://192.168.88.150:8000/api/create_tasks_ui", {
        projectId,
        phaseId,
        phaseActivityId: activityId,
        task: newTask.task,
        description: newTask.description,
        department: newTask.department,
        start_date: formatDate(newTask.start_date),
        end_date: formatDate(newTask.end_date),
        businessanalysts: newTask.assigneBa,
      })
      .then((response) => {
        onSuccess(response.data.message);
        setCreateTaskDialogVisible(false);
        setNewTask({
          task: "",
          department: "",
          description: "",
          start_date: null,
          end_date: null,
          assigneBa: [],
        });
        setTaskCreate(false);
        fetchSubtasks(projectId, phaseId, activityId);
      })
      .catch((error) => {
        onError(error.response.message);
        setTaskCreate(false);
      });
  };

  //filter for displaying project crew to be assigned
  const filterUserData = () => {
    return projectUsers.filter(
      (user) => user.user.department === editingTask.department
    );
  };
  //options based on department
  const userOptions = filterUserData().map((user, index) => ({
    key: index,
    label: user.user.firstName + " " + user.user.lastName,
    value: user.user.email, // Use the appropriate property for email
  }));
  //option based on business analyst in the project
  const bas = businessAnalysts.map((user, index) => ({
    key: index,
    label: user.user.firstName + " " + user.user.lastName,
    value: user.user.email, // Use the appropriate property for email
  }));

  //updtaing the task details

  const handleEditTaskSave = () => {
    setEditLoading(true);
    axios
      .put(`http://192.168.88.150:8000/api/updateSubtask/${editingTask.id}`, {
        projectId,
        phaseId,
        phaseActivityId: activityId,
        task: editingTask.task,
        department: editingTask.department,
        assigned_to: selectedUsers,
        baassigned_to: [editingTask.assigneBa],
        description: editingTask.description,
        start_date: formatDate(editingTask.start_date),
        end_date: formatDate(editingTask.end_date),
      })
      .then((response) => {
        onSuccess(response.data.message);
        handleCloseEditModal();
        fetchSubtasks(projectId, phaseId, activityId);
        setEditingTask({
          id: null,
          task: "",
          description: "",
          department: "",
          start_date: null,
          end_date: null,
          assigned_to: [],
          assigneBa: [],
        });
      })
      .catch((error) => {
        // Handle error, display an error message
        console.log(error);
        onError("Error updating task details.");
        setEditLoading(false);
      })
      .finally(() => {
        setEditLoading(false); // Hide loading spinner
      });
  };
  //Obtaining the already assigned users
  const selected = filterUserData().filter((user) =>
    editingTask.assigned_to.includes(user.user.email)
  );

  const UserCard = ({ user }) => {
    return (
      <Card title={`${user.user.firstName} ${user.user.lastName}`}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <div style={{ flex: 1 }}>
            <strong>Email:</strong> {user.user.email}
            <br />
            <strong>Contacts:</strong> {user.user.contacts}
          </div>
          <div className="w-20 h-20 rounded-full overflow-hidden">
            <img
              src={
                user.user.profile_pic
                  ? baseUrl + user.user.profile_pic
                  : process.env.PUBLIC_URL + "/profile2.jpeg"
              }
              alt="User"
              className="w-full h-full rounded-full object-cover"
            />
          </div>
        </div>
      </Card>
    );
  };

  return (
    <div>
      <Toast ref={toast} />
      <ConfirmDialog />
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
                  {loading ? (
                    <i
                      className="pi pi-spin pi-spinner"
                      style={{ fontSize: "2rem" }}
                    ></i>
                  ) : (
                    <button
                      className="px-4 py-2 bg-blue-500 text-white rounded-md"
                      onClick={handleSaveEditChanges}
                    >
                      Save
                    </button>
                  )}

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
          header={
            <button
              className="px-4 py-2 bg-blue-500 text-white rounded-md focus:outline-none focus:shadow-outline mt-4"
              onClick={() => setCreateTaskDialogVisible(true)}
            >
              Add Task
            </button>
          }
        >
          <DataTable
            value={subtasks}
            emptyMessage="No subtasks found."
            className="p-datatable-gridlines"
            removableSort
          >
            <Column
              field="task"
              header="Task Name"
              sortable
              filter
              filterPlaceholder="Search by task name"
            ></Column>
            <Column field="description" header="Task Description"></Column>
            <Column field="start_date" header="Start Date" sortable></Column>
            <Column field="end_date" header="End Date" sortable></Column>
            <Column
              field="businessanalyst"
              header="Business Analyst"
              sortable
              body={(rowData) => (
                <div key={rowData.id}>
                  {rowData.baassigned_to.map((user) => (
                    <div key={user.id}>{user.email}</div>
                  ))}
                </div>
              )}
            ></Column>
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
              body={(rowData) => (
                <div key={rowData.id}>
                  {rowData.assigned_to.map((user) => (
                    <div key={user.id}>{user.email}</div>
                  ))}
                </div>
              )}
              sortable
              filter
              filterPlaceholder="Search by assigned to"
            ></Column>
            <Column field="delegatedTo" header="Delegated" sortable></Column>
            <Column
              field="status"
              header="Status"
              sortable
              body={statusBodyTemplate}
              filter
              filterElement={statusFilterTemplate}
              filterPlaceholder="Search by status"
            ></Column>
            <Column
              header="Edit"
              body={(rowData) => (
                <div className="flex" key={rowData.id}>
                  <AiFillEdit
                    className="bg-blue-500 text-white rounded"
                    size={30}
                    style={{ marginRight: 4 }}
                    onClick={() => handleTaskSelection(rowData)} // Add this line
                  />
                  <RiDeleteBin5Fill
                    className="bg-red-500 text-white rounded"
                    size={30}
                    style={{ marginRight: 4 }}
                    onClick={() => confirmDelete(rowData.id)}
                  />
                </div>
              )}
            ></Column>
          </DataTable>
          {/*Add/Create task Modal */}
          <Dialog
            header="Add Task"
            visible={createTaskDialogVisible}
            onHide={() => setCreateTaskDialogVisible(false)}
            className="w-2/3"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ">
              {/*Left section on full screen*/}
              <div className="col-span-1 md:col-span-1">
                <div className="mb-4">
                  <label htmlFor="task" className="block font-medium mb-1">
                    Task:
                  </label>
                  <input
                    type="text"
                    id="task"
                    value={newTask.task}
                    onChange={(e) =>
                      setNewTask({ ...newTask, task: e.target.value })
                    }
                    className="w-full border rounded py-2 px-3"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label
                    htmlFor="description"
                    className="block font-medium mb-1"
                  >
                    Task Description:
                  </label>
                  <Editor
                    type="text"
                    id="description"
                    value={newTask.description}
                    onTextChange={(e) =>
                      setNewTask({ ...newTask, description: e.textValue })
                    }
                    className="w-full border rounded py-2 px-3"
                    style={{ height: "320px" }}
                  />
                </div>
              </div>
              {/*Rigth section on full screen*/}
              <div className="col-span-1 md:col-span-1">
                <div className="mb-4">
                  <label
                    htmlFor="department"
                    className="block font-medium mb-1"
                  >
                    Department:
                  </label>
                  <Dropdown
                    id="department"
                    value={newTask.department}
                    options={departments.map((dep) => ({
                      label: dep,
                      value: dep,
                    }))}
                    onChange={(e) =>
                      setNewTask({ ...newTask, department: e.value })
                    }
                    placeholder="Select a department"
                    className="w-full border rounded py-2 px-3"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label
                    htmlFor="start_date"
                    className="block font-medium mb-1"
                  >
                    Start Date:
                  </label>
                  <Calendar
                    id="start_date"
                    value={newTask.start_date}
                    onChange={(e) =>
                      setNewTask({ ...newTask, start_date: e.value })
                    }
                    className="w-full  rounded"
                    dateFormat="yy/mm/dd"
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="end_date" className="block font-medium mb-1">
                    End Date:
                  </label>
                  <Calendar
                    id="end_date"
                    value={newTask.end_date}
                    onChange={(e) =>
                      setNewTask({ ...newTask, end_date: e.value })
                    }
                    className="w-full  rounded"
                    dateFormat="yy/mm/dd"
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="businessAnalyst">
                    Assign to Business Analyst:
                  </label>
                  <Dropdown
                    id="business-ananlyst"
                    value={newTask.assigneBa}
                    options={bas}
                    onChange={(e) =>
                      setNewTask({ ...newTask, assigneBa: e.value })
                    }
                    placeholder="Select a business analyst"
                    className="w-full border rounded py-2 px-3"
                    required
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-between">
              <button
                className="px-4 py-2 bg-blue-500 text-white rounded-md"
                onClick={handleCreateTask}
              >
                {taskcreate ? (
                  <i
                    className="pi pi-spin pi-spinner"
                    style={{ fontSize: "1.5rem" }}
                  ></i>
                ) : (
                  "Save"
                )}
              </button>
              <button
                className="mr-2 px-4 py-2 bg-red-500 text-white rounded-md"
                onClick={() => setCreateTaskDialogVisible(false)}
              >
                Cancel
              </button>
            </div>
          </Dialog>

          <div className="flex justify-between">
            <button
              className="px-4 py-2 bg-blue-500 text-white rounded-md focus:outline-none focus:shadow-outline mt-4"
              onClick={handlePushtoSprint}
            >
              {pustLoading ? (
                <i
                  className="pi pi-spin pi-cog"
                  style={{ fontSize: "1.5rem" }}
                ></i>
              ) : (
                "Push to sprint"
              )}
            </button>

            <button
              className="px-4 py-2 bg-red-500 text-white rounded-md focus:outline-none focus:shadow-outline mt-4"
              onClick={() => setIsViewModalOpen(false)}
            >
              Cancel
            </button>
          </div>
        </Dialog>

        {/*Edit Micro-task Modal */}
        <Dialog
          header="Add Task"
          visible={isEditTaskModalOpen}
          onHide={() => setIsEditTaskModalOpen(false)}
          className="w-4/5"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/*Left section of the fullscreen */}
            <div className="col-span-1 md:col-span-1">
              <div className="mb-4">
                <label htmlFor="edit-task" className="block font-medium mb-1">
                  Task:
                </label>
                <input
                  type="text"
                  id="edit-task"
                  value={editingTask?.task || ""}
                  onChange={(e) =>
                    setEditingTask({ ...editingTask, task: e.target.value })
                  }
                  className="w-full border rounded py-2 px-3"
                  required
                />
              </div>
              <div className="mb-4">
                <label
                  htmlFor="edit-description"
                  className="block font-medium mb-1"
                >
                  Task Description:
                </label>
                <Editor
                  id="edit-description"
                  value={editingTask.description}
                  onTextChange={(newText) =>
                    setEditingTask({
                      ...editingTask,
                      description: newText.textValue,
                    })
                  }
                  className="w-full border rounded py-2 px-3"
                  style={{ height: "320px" }}
                />
              </div>
              <div className="mb-4">
                <label htmlFor="businessAnalyst">
                  Assign to Business Analyst:
                </label>
                <Dropdown
                  id="business-ananlyst"
                  value={editingTask.assigneBa}
                  options={bas}
                  onChange={(e) =>
                    setEditingTask({ ...editingTask, assigneBa: e.value })
                  }
                  placeholder="Select a business analyst"
                  className="w-full border rounded py-2 px-3"
                  required
                />
              </div>
            </div>
            {/*Rigth section of the fullscreen */}
            <div className="col-span-1 md:col-span-1">
              <div className="mb-4">
                <label
                  htmlFor="edit-start-date"
                  className="block font-medium mb-1"
                >
                  Start Date:
                </label>
                <Calendar
                  id="edit-start-date"
                  value={editingTask.start_date ? editingTask.start_date : null}
                  onChange={(e) =>
                    setEditingTask({ ...editingTask, start_date: e.value })
                  }
                  className="w-full border rounded"
                  dateFormat="yy/mm/dd"
                />
              </div>
              <div className="mb-4">
                <label
                  htmlFor="edit-end-date"
                  className="block font-medium mb-1"
                >
                  End Date:
                </label>
                <Calendar
                  id="edit-end-date"
                  value={editingTask?.end_date || null}
                  onChange={(e) =>
                    setEditingTask({ ...editingTask, end_date: e.value })
                  }
                  className="w-full border rounded"
                  dateFormat="yy/mm/dd"
                />
                <div className="mb-4">
                  <label
                    htmlFor="edit-department"
                    className="block font-medium mb-1"
                  >
                    Department:
                  </label>
                  <Dropdown
                    id="edit-department"
                    value={editingTask?.department || ""}
                    options={departments.map((dep) => ({
                      label: dep,
                      value: dep,
                    }))}
                    onChange={(e) =>
                      setEditingTask({ ...editingTask, department: e.value })
                    }
                    placeholder="Select a department"
                    className="w-full border rounded py-2 px-3"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="Assigned" className="block font-medium mb-1">
                    Assign:
                  </label>
                  <MultiSelect
                    id="assigned_to"
                    value={selectedUsers}
                    options={userOptions}
                    onChange={(e) => setSelectedUsers(e.value)}
                    placeholder="Select users"
                    optionLabel="label"
                    filter
                    showClear
                    className="w-full border rounded py-2 px-3"
                    maxSelectedLabels={3}
                  />
                </div>
                <div className="mb-4">
                  {selected && (
                    <div style={{ overflowY: "auto", height: "250px" }}>
                      {selected.map((user, index) => (
                        <UserCard key={index} user={user} />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-between">
            <button
              className="px-4 py-2 bg-blue-500 text-white rounded-md"
              onClick={handleEditTaskSave}
              disabled={editLoading} // Disable the button while loading
            >
              {editLoading ? (
                <i
                  className="pi pi-spin pi-spinner"
                  style={{ fontSize: "1.5rem" }}
                ></i>
              ) : (
                "Save"
              )}
            </button>

            <button
              className="mr-2 px-4 py-2 bg-red-500 text-white rounded-md"
              onClick={handleCloseEditModal}
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
