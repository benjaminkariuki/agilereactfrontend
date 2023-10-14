import React, { useState, useEffect, useRef } from "react";
import { Card } from "primereact/card";
import { useSelector } from "react-redux/es/hooks/useSelector";
import axios from "axios";
import { Toast } from "primereact/toast";
import { Chart } from "primereact/chart";
import _ from "lodash";
import { useNavigate } from "react-router-dom";




const Admin = () => {
  const [userCount, setUserCount] = useState(0);
  const [rolesCount, setRolesCount] = useState(0);
  const [departmentCount, setdepartmentCount] = useState(0);
  const navigate = useNavigate();

  
  const [chartDatafromApi, setChartDataFromAPi] = useState([]);
  const [chartDatafromRolesApi, setChartDataFromRolesAPi] = useState([]);

  const [chartData, setChartData] = useState({});
  const [chartDataRoles, setChartDataRoles] = useState({});
  const [errorMessage, setErrorMessage] = useState("");
  const toast = useRef(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);

    Promise.all([
      fetchUsersCount(),
      fetchRolesCount(),
      fetchDepartmentCount(),
      fetchDepartmentCountPerUser(),
      fetchRolesCountPerUser(),
    ]).finally(() => {
      setIsLoading(false);
    });
  }, []); // The empty dependency array ensures the effect runs once after the component mounts.

  const handleErrorMessage = (error) => {
    if (
      error &&
      error.response &&
      error.response.data &&
      error.response.data.message
    ) {
      // Handle error messages directly under data property
      return error.response.data.message;
    } else if (
      error &&
      error.response &&
      error.response.data &&
      error.response.data.errors
    ) {
      // Extract error messages and join them into a single string
      return Object.values(error.response.data.errors).flat().join(" ");
    } else if (
      error &&
      error.response &&
      error.response.data &&
      error.response.data.error
    ) {
      // Handle error structures like {error: "No active sprint found"}
      return error.response.data.error;
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

  const onFetchingRoles = (error) => {
    if (toast.current && error) {
      toast.current.show({
        severity: "warn",
        summary: "Error",
        detail: handleErrorMessage(error),
        life: 3000,
      });
    }
  };



  const fetchUsersCount = async () => {
    try {

      const token = sessionStorage.getItem('token'); // Ensure token is retrieved correctly

    const config = {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    };
      const response = await axios.get(
        "https://agile-pm.agilebiz.co.ke/api/allUsersCount",
        config
      );
      if (response.status === 401) {
        navigate('/');
      }

      const fetchedusers = response.data.userCount;
      setUserCount(fetchedusers);

      if (response.status === 200) {
        setErrorMessage("");
      }
    } catch (error) {
     
      setErrorMessage("Failed to get users count");
      onFetchingRoles(error);
    }
  };

  const fetchRolesCount = async () => {
    try {
      const token = sessionStorage.getItem('token'); // Ensure token is retrieved correctly

    const config = {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    };
      const response = await axios.get(
        "https://agile-pm.agilebiz.co.ke/api/allRolesCount",
        config
      );

      if (response.status === 401) {
        navigate('/');
      }

      const fetchedrolescount = response.data.rolesCount;
      setRolesCount(fetchedrolescount);

      if (response.status === 200) {
        setErrorMessage("");
      }
    } catch (error) {
    
      setErrorMessage("Failed to get roles count");
      onFetchingRoles(error);
    }
  };

  const fetchDepartmentCount = async () => {
    try {
      const token = sessionStorage.getItem('token'); // Ensure token is retrieved correctly

    const config = {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    };
      const response = await axios.get(
        "https://agile-pm.agilebiz.co.ke/api/allDepartmentsCount",
        config
      );
      if (response.status === 401) {
        navigate('/');
      }

      const fetcheddepartmentcount = response.data.departmentCount;
      setdepartmentCount(fetcheddepartmentcount);

      if (response.status === 200) {
        setErrorMessage("");
      }
    } catch (error) {
     
      setErrorMessage("Failed to get departments count");
      onFetchingRoles(error);
    }
  };

  const fetchDepartmentCountPerUser = async () => {
    try {
      const token = sessionStorage.getItem('token'); // Ensure token is retrieved correctly

    const config = {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    };
      const response = await axios.get(
        "https://agile-pm.agilebiz.co.ke/api/allDepartmentsCountPerUser",
        config
      );

      if (response.status === 401) {
        navigate('/');
      }

      const fetcheddepartmentcountperUser = response.data.departments;
      setChartDataFromAPi(fetcheddepartmentcountperUser);

      if (response.status === 200) {
        setErrorMessage("");
      }
    } catch (error) {
      
      setErrorMessage("Failed to get departments count per user");
      onFetchingRoles(error);
    }
  };

  const fetchRolesCountPerUser = async () => {
    try {

      const token = sessionStorage.getItem('token'); // Ensure token is retrieved correctly

    const config = {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    };

      const response = await axios.get(
        "https://agile-pm.agilebiz.co.ke/api/allRolesCountPerUser",
        config
      );

      if (response.status === 401) {
        navigate('/');
      }
      const fetchedrolescountperUser = response.data.roles;
      setChartDataFromRolesAPi(fetchedrolescountperUser);

      if (response.status === 200) {
        setErrorMessage("");
      }
    } catch (error) {
     
      setErrorMessage("Failed to get roles count per user");
      onFetchingRoles(error);
    }
  };


  useEffect(() => {
    const departments = chartDatafromApi.map((d) => d.department);
    const userCounts = chartDatafromApi.map((d) => d.userCount);

    const rolesapi_name = chartDatafromRolesApi.map((r) => r.name);
    const rolesuser_count = chartDatafromRolesApi.map((c) => c.userCount);

    const rolesapi_name_in_sentence_case = rolesapi_name.map(name => _.startCase(name));
    const departments_count_name_in_sentence_case = departments.map(name => _.startCase(name));


  
    setChartData({
      labels: departments_count_name_in_sentence_case, 
      datasets: [
        {
          label: "Number of Users",
          backgroundColor: "#42A5F5",
          data: userCounts,
        },
      ],
    });


    setChartDataRoles({
      labels: rolesapi_name_in_sentence_case,
      datasets: [
        {
          label: "Number of Users",
          backgroundColor: "#42A5F5",
          data: rolesuser_count,
        },
      ],
    });

  }, [chartDatafromApi, chartDatafromRolesApi]);

  const chartOptions = {
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          // Ensure only whole numbers are used
          stepSize: 5,
          callback: function (value) {
            if (Math.floor(value) === value) {
              return value;
            }
          },
        },
      },
    },
  };

  const headerTemplate = (
    <div className="flex justify-between items-center text-white">
      <i className="pi pi-users text-4xl"></i>
      <span>Number of Users</span>
    </div>
  );

  const headerTemplateRoles = (
    <div className="flex justify-between items-center text-white">
      <i className="pi pi-folder text-4xl"></i>
      <span>Number of Roles</span>
    </div>
  );

  const headerTemplateDepartments = (
    <div className="flex justify-between items-center text-white">
      <i className="pi pi-folder text-4xl"></i>
      <span>Number of Departments</span>
    </div>
  );



  return !isLoading ? (
    <div className="flex flex-col p-5 md:space-y-8 space-y-4 h-full mb-12 overflow-auto">
      <Toast ref={toast} />
      <div className="flex flex-col md:flex-row md:space-x-8 space-y-4 md:space-y-0 flex-grow ">
        <div className="flex-1 p-4">
          <Card
            // title={titleTemplate}
            className="rounded shadow-md h-full"
            style={{ background: "linear-gradient(195deg, rgb(73, 163, 241), rgb(26, 115, 232)" }}
            header={headerTemplate}
          >
            <div className="flex justify-center items-center h-full text-white">
              <p className="text-6xl font-semibold">{userCount}</p>
            </div>
          </Card>
        </div>

        <div className="flex-1 p-4">
          <Card
            // title={titleTemplateRoles}
            className="rounded shadow-md h-full"
            style={{ background: "linear-gradient(195deg, rgb(102, 187, 106), rgb(67, 160, 71)" }}
            header={headerTemplateRoles}
          >
            <div className="flex justify-center items-center h-full text-white">
              <p className="text-6xl font-semibold">{rolesCount}</p>
            </div>
          </Card>
        </div>

        <div className="flex-1 p-4">
          <Card
            // title={titleTemplateDepartments}
            className="rounded shadow-md h-full"
            style={{ background: "linear-gradient(195deg, rgb(66, 66, 74), rgb(25, 25, 25)" }}
            header={headerTemplateDepartments}
          >
            <div className="flex justify-center items-center h-full text-white">
              <p className="text-6xl font-semibold">{departmentCount}</p>
            </div>
          </Card>
        </div>
      </div>

        {/* Place for graphs and other content */}
        <div className="flex-1 p-4">
        <div className="rounded shadow-md p-4"  style={{ backgroundColor: "white" }}>

            <p className="text-xl font-semibold mb-2 text-black-500">Users by Department</p>
            <div className="h-full">
              <Chart type="bar" data={chartData} options={chartOptions} />
            </div>
          </div>
        </div>

        <div className="flex-1 p-4">
        <div className="rounded shadow-md p-4"  style={{ backgroundColor: "white" }}>
            <p className="text-xl font-semibold mb-2 text-black-500">Users by Roles</p>
            <div className="h-full">
              <Chart type="bar" data={chartDataRoles} options={chartOptions} />
            </div>
          </div>
        </div>
      
    </div>
  ) : (
    <div className="flex justify-center items-center h-24">
      <i className="pi pi-spin pi-spinner text-blue-500 md:text-4xl text-3xl"></i>
    </div>
  );
};

export default Admin;
