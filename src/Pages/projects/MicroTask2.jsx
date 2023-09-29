import React, { useState, useRef, useEffect } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Toast } from "primereact/toast";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { Tag } from "primereact/tag";
import axios from "axios";
import { Calendar } from "primereact/calendar";
import FileDownload from "react-file-download";
import { AiFillEdit } from "react-icons/ai";
import { RiDeleteBin5Fill } from "react-icons/ri";
import { confirmDialog } from "primereact/confirmdialog";
import { FilterMatchMode, FilterOperator } from "primereact/api";
import { useSelector } from "react-redux";
import { Paginator } from "primereact/paginator";
import levenshtein from 'fast-levenshtein';

const MicroTask = ({
  projectId,
  activityId,
  phaseId,
  selectedIcon,
  organization,
}) => {
  const toast = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [subtasks, setSubtasks] = useState([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [filters, setFilters] = useState(null);
  const [statuses] = useState(["pending", "completed", "highpriority"]);
  const [loading, setIsLoading] = useState(false);
  const [isloading, set_IsLoading] = useState(false);
  const [pustLoading, setPushLoading] = useState(false);
  const [taskcreate, setTaskCreate] = useState(false);
  const [page, setPage] = useState(0);
  const [totalRecords, setTotalRecords] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");

  const [departments] = useState([
    "Management",
    "Administration",
    "Web And Mobile",
    "Project Managers",
    "Business Central",
    "Infrastructure",
    "Implementation",
    "Finance",
    "Human Resource",
    "Sales and Marketing",
    "Sales",
  ]);

  const [createTaskDialogVisible, setCreateTaskDialogVisible] = useState(false);
  const [newTask, setNewTask] = useState({
    task: "",
    department: "",
    description: "",
    start_date: null,
    end_date: null,
    assigneBa: "",
    assigneTl: "",
  });

  const [editingTask, setEditingTask] = useState({
    id: null,
    task: "",
    description: "",
    department: "",
    start_date: null,
    end_date: null,
    assignedTl: "",
    assigneBa: "",
  });

  const [isEditTaskModalOpen, setIsEditTaskModalOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [projectUsers, setProjectUsers] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [preAssigned, setPreAssigned] = useState([]);
  const { userActivities } = useSelector((state) => state.user);
  const [showPreassigned, setShowPreassigned] = useState(false);

  //getting the permission for projects
  const projectsActivity = userActivities.find(
    (activity) => activity.name === "Projects"
  );
  const hasReadPermissionProject = projectsActivity
    ? projectsActivity.pivot.permissions.includes("read")
    : false;
  const hasWritePermissionProject = projectsActivity
    ? projectsActivity.pivot.permissions.includes("write")
    : false;

  //getting permission for tasks
  const tasksActivity = userActivities.find(
    (activity) => activity.name === "Tasks"
  );

  const hasWritePermissionTasks = tasksActivity
    ? tasksActivity.pivot.permissions.includes("write")
    : false;

  //getting permission for sprints Sprint priorities === for pms to push to active sprint
  const sprintprioritiesActivity = userActivities.find(
    (activity) => activity.name === "Sprint priorities"
  );

  const hasWritePermissionSprint = sprintprioritiesActivity
    ? sprintprioritiesActivity.pivot.permissions.includes("write")
    : false;

    const isSimilar = (str1, str2, threshold = 3) => {
      return levenshtein.get(str1, str2) <= threshold;
    };
  // Move this effect to handle selectedIcon changes
  useEffect(() => {
    if (selectedIcon === "add") {
      setIsEditModalOpen(true);
    } else if (selectedIcon === "view") {
      setIsViewModalOpen(true);
      fetchSubtasks(projectId, phaseId, activityId);
    }
   
    // initFilters();
  }, [
    projectId,
    phaseId,
    activityId,
    selectedIcon,
    organization,
  ]);

  useEffect(() => {
    fetchSubtasks(projectId,phaseId,activityId);
  }, [page]);

  const getSeverity = (status) => {
    switch (status) {
      case "incomplete":
        return "danger";
      case "open":
        return "info";
      case "complete":
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

  const onErrorF = (error) => {
    if (error) {
      toast.current?.show({
        severity: "error",
        summary: "Error occurred",
        detail: handleErrorMessage(error),
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


  const onWarnF = (error) => {
    if (error) {
      toast.current?.show({
        severity: "warn",
        summary: "Please upload micro task(s)",
        detail: handleErrorMessage(error),
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

  // const initFilters = () => {
  //   setFilters({
  //     status: {
  //       operator: FilterOperator.OR,
  //       constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }],
  //     },
  //     task: {
  //       operator: FilterOperator.AND,
  //       constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }],
  //     },
  //     assigned_to: {
  //       operator: FilterOperator.AND,
  //       constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }],
  //     },
  //   });
  // };

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
      .post("https://agile-pm.agilebiz.co.ke/api/create_tasks", formData, {
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
        setIsLoading(false);
      });
  };

  const handleDownloadTemplate = () => {
    axios
      .get("https://agile-pm.agilebiz.co.ke/api/download-excel-tasks", {
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
    const sDate = new Date(rowData.start_date);
    const eDate = new Date(rowData.end_date);

    setEditingTask({
      id: rowData.id,
      task: rowData.task,
      description: rowData.description,
      department: rowData.department,
      start_date: sDate,
      end_date: eDate,
    });
    setPreAssigned(rowData.assigned_to.concat(rowData.baassigned_to));
    setIsEditTaskModalOpen(true); // Open the edit modal
  };

  const handleErrorMessage = (error) => {
    if (
      error &&
      error.response &&
      error.response.data &&
      error.response.data.errors
    ) {
      // Extract error messages and join them into a single string
      return Object.values(error.response.data.errors).flat().join(" ");
    } else if (error && error.message) {
      // Client-side error (e.g., no internet)
      return error.message;
    }
    // If no errors property is found, return the main message or a default error message
    return error &&
      error.response &&
      error.response.data &&
      error.response.data.message
      ? error.response.data.message
      : "An unexpected error occurred.";
  };

  const handleCloseEditModal = () => {
    setEditingTask({
      id: null,
      task: "",
      description: "",
      department: "",
      start_date: null,
      end_date: null,
      assignedTl: [],
      assigneBa: [],
    });
    setEditLoading(false);
    setIsEditTaskModalOpen(false);
  };

  const handleMicroTaskDelete = (id) => {
    axios
      .delete(`https://agile-pm.agilebiz.co.ke/api/deleteSubtask/${id}`, {
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
        if (error.response.status === 422) {
          onError(error.response.data.message);
        } else {
          onError(error.response.message);
        }
      });
  };

  const handleSearch = () => {
    if (searchTerm || searchTerm.trim() !== "") {
      set_IsLoading(true);
      // Modify the endpoint to accommodate the searchTerm in the query string
      axios
        .get(
          `https://agile-pm.agilebiz.co.ke/api/getSubtasks/${projectId}/${phaseId}/${activityId}?page=${
            page + 1
          }&searchTerm=${searchTerm}`
        )
        .then((response) => {
          set_IsLoading(false);
          console.log(response.data.data.data);
          setSubtasks(response.data.data.data);
          setTotalRecords(response.data.data.total);
         
        })
        .catch((error) => {
          set_IsLoading(false);
          // onErrorF(error.response.message);
          console.error("Error getting projects:", error);
          
        });
    } else {
      // If there is no search term, just fetch porjects normally
      fetchSubtasks(projectId,phaseId,activityId);
    }
  };
  // effect to fetch subtasks
  const fetchSubtasks = (projectId, phaseId, activityId) => {
    set_IsLoading(true);
    axios
      .get(
        `https://agile-pm.agilebiz.co.ke/api/getSubtasks/${projectId}/${phaseId}/${activityId}?page=${
          page + 1
        }`
      )
      .then((response) => {
        set_IsLoading(false);
        setSubtasks(response.data.data.data);
        console.log(response.data.data.data);
        setTotalRecords(response.data.data.total);
        // onSuccess("Successfully fetched Micro tasks");
      })
      .catch((error) => {
        set_IsLoading(false);
        if (error.response && error.response.status === 404) {
          // onWarn(error.response.message);
        } else {
          // onErrorF(error.response.message);
        }
      });
  };

  //function for [pushing to sprint
  const handlePushtoSprint = () => {
    setPushLoading(true);
    const selectedIds = selectedRows.map((row) => row.id);
    axios
      .post("https://agile-pm.agilebiz.co.ke/api/pushToSprint", {
        taskIds: selectedIds,
      })
      .then((response) => {
        onInfo(response.data.message);
        setPushLoading(false);
        setIsViewModalOpen(false);
      })
      .catch((error) => {
        if (error.response.status === 400) {
          onError(error.response.data.error);
        } else {
          onError(error.response.message);
        }
        setPushLoading(false);
      });
  };

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
      .post("https://agile-pm.agilebiz.co.ke/api/create_tasks_ui", {
        projectId,
        phaseId,
        phaseActivityId: activityId,
        task: newTask.task,
        description: newTask.description,
        department: newTask.department,
        start_date: formatDate(newTask.start_date),
        end_date: formatDate(newTask.end_date),
        baassigned_to: newTask.assigneBa ? [newTask.assigneBa] : [],
        assigned_to: newTask.assigneTl ? [newTask.assigneTl] : [],
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
          assigneBa: "",
          assigneTl: "",
        });
        setTaskCreate(false);
        fetchSubtasks(projectId, phaseId, activityId);
      })
      .catch((error) => {
        onError(error.response.data.message);
        setTaskCreate(false);
      });
  };

  //closing the create rask modal
  const closeTaskCreate = () => {
    setNewTask({
      task: "",
      department: "",
      description: "",
      start_date: null,
      end_date: null,
      assigneBa: "",
      assigneTl: "",
    });
    setCreateTaskDialogVisible(false);
  };
  //option based on business analyst in the project
  const bas = organization
  ?.filter(
    (user) =>
      user.status === "active" &&
      user.user?.department
        ?.toLowerCase() === "implementation" &&
      (
        isSimilar(user.user?.role?.name?.replace(/[-\s]/g, '').toLowerCase(), "teamleadimplementation") ||
        isSimilar(user.user?.role?.name?.replace(/\s/g, '').toLowerCase(), "headbusinessanalyst")
      )
  )
  .map((user, index) => ({
      key: index,
      label: user.user?.firstName + " " + user.user?.lastName + " " + user.user?.email,
      value: user.user?.email,
  }));

  const imp = organization
  ?.filter(
    (user) =>
      user.status === "active" &&
      (
        (isSimilar(user.user?.department?.replace(/\s/g, '').toLowerCase(), "projectmanagers") &&
        isSimilar(user.user?.role?.name?.replace(/\s/g, '').toLowerCase(), "portfoliomanager"))
        ||  
        (isSimilar(user.user?.department?.replace(/\s/g, '').toLowerCase(), "businesscentral") &&
        user.user?.role?.name?.toLowerCase().includes("team lead"))   
        ||
        (isSimilar(user.user?.department?.replace(/\s/g, '').toLowerCase(), "webandmobile") &&
        user.user?.role?.name?.toLowerCase().includes("team lead"))
      )
  )
  .map((user, index) => ({
      key: index,
      label: user.user?.firstName + " " + user.user?.lastName + " - " + user.user?.email,
      value: user.user?.email,
  }));





  //option based on team leads in the project
  const assigningUser = (department) => {
    const depNormalized = department.toLowerCase().replace(/\s+/g, ''); // Removing spaces and converting to lowercase
    let sourceArray;
  
    if (depNormalized.toLowerCase() === "projectmanagers") {
      sourceArray = organization.filter(user => {
        const roleName = user.user?.role?.name?.toLowerCase();
        return user.status === 'active' && 
          roleName.includes("portfolio manager");
      });
    } else if (depNormalized.toLowerCase() === "webandmobile") {
      sourceArray = organization.filter(user => {
        const roleName = user.user?.role?.name?.toLowerCase();
        return user.status === 'active' && 
          (roleName.includes("team lead"));
      });
    } else if (depNormalized.toLowerCase() === "businesscentral") {
      sourceArray = organization.filter(user => {
        const roleName = user.user?.role?.name?.toLowerCase();
        return user.status === 'active' && 
          (roleName.includes("team lead"));
      });
    } else {
      // Handle other cases or just default to an empty array or another default value
      sourceArray = [];
    }

    const filteredUser = sourceArray?.filter(
      (user) =>
        user.user?.department.toLowerCase() === department.toLowerCase() &&
        user?.status === "active"
    );

    return filteredUser.map((user, index) => ({
      key: index,
      label:
        user.user?.firstName +
        " " +
        user.user?.lastName +
        "-" +
        user.user?.role.name,
      value: user?.user.email,
    }));
  
    
  };

   

  //updtaing the task details
  const handleEditTaskSave = () => {
    setEditLoading(true);
    axios
      .put(
        `https://agile-pm.agilebiz.co.ke/api/updateSubtask/${editingTask.id}`,
        {
          projectId,
          phaseId,
          phaseActivityId: activityId,
          task: editingTask.task,
          department: editingTask.department,
          assigned_to: editingTask.assignedTl ? [editingTask.assignedTl] : [],
          baassigned_to: editingTask.assigneBa ? [editingTask.assigneBa] : [],
          description: editingTask.description,
          start_date: formatDate(editingTask.start_date),
          end_date: formatDate(editingTask.end_date),
        }
      )
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
          assignedTl: "",
          assigneBa: "",
        });
      })
      .catch((error) => {
        onError("Error updating task details.");
        setEditLoading(false);
      });
  };

  return (
    <div>
      <Toast ref={toast} />

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
          style={{ width: "98vw" }}
          header={
            <>
              {hasWritePermissionTasks && (
                <button
                  className="px-4 py-2 bg-blue-500 text-white rounded-md focus:outline-none focus:shadow-outline mt-4"
                  onClick={() => setCreateTaskDialogVisible(true)}
                >
                  Add Task
                </button>
              )}
        
              {/* Search Input - outside the conditional rendering */}
              <div className="mb-4 flex justify-end mt-0.5">
                <input
                  type="text"
                  placeholder="Search tasks"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    handleSearch();
                  }}
                  className="border rounded px-2 py-1 w-1/3 mr-2"
                />
              </div>
            </>
          }
          footer={
            <div className="flex justify-between">
              {hasWritePermissionSprint && (
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
              )}

              <button
                className="px-4 py-2 bg-red-500 text-white rounded-md focus:outline-none focus:shadow-outline mt-4"
                onClick={() => setIsViewModalOpen(false)}
              >
                Cancel
              </button>
            </div>
          }
        >

{isloading ? (
  <div className="flex justify-center items-center h-24">
    <i className="pi pi-spin pi-spinner text-blue-500 text-4xl"></i>
  </div>
) : subtasks.length === 0 ? (
  <div>No subtasks found.</div>
) : (

          <DataTable
            value={subtasks}
            emptyMessage="No subtasks found."
            className="p-datatable-gridlines"
            removableSort
            selectionMode="checkbox"
            selection={selectedRows}
            onSelectionChange={(e) => setSelectedRows(e.value)}
            dataKey="id"
          >
            {hasWritePermissionSprint && (
              <Column
                selectionMode="multiple"
                headerStyle={{ width: "3rem" }}
              ></Column>
            )}

            <Column
              field="task"
              header="Task Name"
              sortable
              filter
              filterPlaceholder="Search by task name"
              body={(rowData) => `${subtasks.indexOf(rowData) + 1}. ${rowData.task}`}

            ></Column>
            {/* <Column field="description" header="Task Description"></Column> */}
            <Column field="start_date" header="Start Date" sortable></Column>
            <Column field="end_date" header="End Date" sortable></Column>
            <Column
              field="businessanalyst"
              header="Business Analyst"
              sortable
              body={(rowData) => (
                <div key={rowData.id}>
                  {rowData.baassigned_to
                    .filter((user) => user.deassigned === 0)
                    .map((user) => (
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
              header="Assigned Team Lead"
              body={(rowData) => (
                <div key={rowData.id}>
                  {rowData.assigned_to
                    .filter((user) => user.deassigned === 0)
                    .map((user) => (
                      <div key={user.id}>{user.email}</div>
                    ))}
                </div>
              )}
              sortable
              filter
              filterPlaceholder="Search by assigned to"
            ></Column>
            {/* <Column field="delegatedTo" header="Delegated" sortable></Column> */}
            <Column
              field="status"
              header="Status"
              sortable
              body={statusBodyTemplate}
              filter
              filterElement={statusFilterTemplate}
              filterPlaceholder="Search by status"
            ></Column>
            {hasWritePermissionTasks && (
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
            )}
          </DataTable>
)}
          {/* Pagination Controls */}

          <div className="mb-6">
            {subtasks.length > 0 ? (
              <Paginator
                first={page * 10}
                rows={10}
                totalRecords={totalRecords}
                onPageChange={(e) => {
                  setPage(e.page);
                }}
                template={{
                  layout: "PrevPageLink CurrentPageReport NextPageLink",
                }}
              />
            ) : (
              ""
            )}
          </div>
        </Dialog>

        {/*Add/Create task Modal */}
        <Dialog
          header="Add Task"
          visible={createTaskDialogVisible}
          onHide={closeTaskCreate}
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
                <label htmlFor="description" className="block font-medium mb-1">
                  Task Description:
                </label>
                <textarea
                  type="text"
                  id="description"
                  defaultValue={newTask.description}
                  onChange={(e) => {
                    setNewTask({ ...newTask, description: e.target.value });
                  }}
                  className="w-full border rounded py-2 px-3"
                  style={{ height: "320px" }}
                />
              </div>
            </div>
            {/*Rigth section on full screen*/}
            <div className="col-span-1 md:col-span-1">
              <div className="mb-4">
                <label htmlFor="department" className="block font-medium mb-1">
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
                <label htmlFor="start_date" className="block font-medium mb-1">
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
              <div className="mb-4">
                <label htmlFor="teamLead">
                  Assign Team Lead or Project Manager:
                </label>
                <Dropdown
                  id="team-lead"
                  value={newTask.assigneTl}
                  options={imp}
                  onChange={(e) =>
                    setNewTask({ ...newTask, assigneTl: e.value })
                  }
                  placeholder="Select a Team Lead"
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
              onClick={closeTaskCreate}
            >
              Cancel
            </button>
          </div>
        </Dialog>

        {/*Edit Micro-task Modal */}
        <Dialog
          header="Edit Task"
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
                  value={editingTask.task}
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
                <textarea
                  id="edit-description"
                  defaultValue={editingTask.description}
                  onChange={(newText) =>
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
                  Assign to Team Lead Implementation:
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
              </div>
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
                <label htmlFor="teamLead">Assign To Team Lead or Project Manager:</label>
                <Dropdown
                  id="team-lead"
                  value={editingTask.assignedTl}
                  options={assigningUser(
                    editingTask.department ? editingTask.department : ""
                  )}
                  onChange={(e) =>
                    setEditingTask({ ...editingTask, assignedTl: e.value })
                  }
                  placeholder="Select a Team Lead"
                  className="w-full border rounded py-2 px-3"
                  required
                />
              </div>
              {/*pre-assigned users */}
              <div className="mb-4">
                <div className="flex justify-center">
                  <Button
                    label="Show Assignments Audit Trail"
                    onClick={() => setShowPreassigned(true)}
                  />

                  <Dialog
                    header="Audit Trail for Assignments"
                    visible={showPreassigned}
                    onHide={() => setShowPreassigned(false)}
                    style={{ width: "80vw", height: "80vw" }}
                  >
                    <DataTable
                      value={preAssigned.filter(
                        (user) => user.deassigned === 0
                      )}
                      header="Assigned Team"
                      className="mt-3"
                    >
                      <Column field="email" header="Email" />
                      <Column field="date" header="Assigned Date" />
                      <Column field="time" header="Assigned Time" />
                      <Column
                        header="Deassigned"
                        body={
                          <Tag
                            value="Not Deassigned"
                            className="p-tag-success"
                          />
                        }
                      />
                      <Column
                        field="deassigned_date"
                        header="Deassigned Date"
                      />
                      <Column
                        field="deassigned_time"
                        header="Deassigned Time"
                      />
                    </DataTable>
                    <DataTable
                      value={preAssigned.filter(
                        (user) => user.deassigned === 1
                      )}
                      header="Deassigned Team"
                    >
                      <Column field="email" header="Email" />
                      <Column field="date" header="Assigned Date" />
                      <Column field="time" header="Assigned Time" />
                      <Column
                        header="Deassigned"
                        body={
                          <Tag value="Deassigned" className="p-tag-danger" />
                        }
                      />
                      <Column
                        field="deassigned_date"
                        header="Deassigned Date"
                      />
                      <Column
                        field="deassigned_time"
                        header="Deassigned Time"
                      />
                    </DataTable>
                  </Dialog>
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
                  style={{ fontSize: "1.4rem" }}
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
