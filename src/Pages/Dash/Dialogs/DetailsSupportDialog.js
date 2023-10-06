import React, { useState, useEffect, useRef } from "react";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import axios from "axios";
import { Toast } from "primereact/toast";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import _ from "lodash";
import { Paginator } from "primereact/paginator";



const DetailsSupportDialog = ({showDetailsSupport, disableShowDelegateDialogSupport }) => {
  const [projectData, setProjectData] = useState([]);

  const [page, setPage] = useState(0);
  const [totalRecords, setTotalRecords] = useState(0);

  const toast = useRef(null);
  const [isLoading, setIsLoading] = useState(false);



  // toast display functions
  const onSuccessRequest = (success) => {
    if (success) {
      toast.current?.show({
        severity: "success",
        summary: "Successfully",
        detail: `${success}`,
        life: 1000,
      });
    }
  };

  const onError = (error) => {
    if (error) {
      toast.current?.show({
        severity: "error",
        summary: "Error occurred",
        detail: `${error}`,
        life: 1000,
      });
    }
  };

  const sentenceCaseFormatter = (rowData, column) => {
    return _.startCase(rowData[column.field]);
  };

  

  useEffect(() => {
    if (showDetailsSupport) {
      setIsLoading(true);
      const token = sessionStorage.getItem('token'); // Ensure token is retrieved correctly

    const config = {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    };
      axios
        .get(
          `https://agile-pm.agilebiz.co.ke/api/allProject_Support_Titles?page=${page + 1}`,config
        )
        .then((response) => {
          // Handle the response data
          
          const projectinfo = (response.data.projectTitles.data);
          setTotalRecords(response.data.projectTitles.total);
          setProjectData(projectinfo);
          setIsLoading(false);
        })
        .catch((error) => {
          // Handle any errors here
          console.error(
            "Error fetching projects in support",
            error
          );
          setIsLoading(false);
        });
    }
  }, [showDetailsSupport,page]);

  const renderFooter = () => {
    return (
      <div>
        {projectData.length > 0 && (
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
        )}
      </div>
    );
  };

  return (
    <div>
      {/* <Toast ref={toast} /> */}
      <Dialog
        header={"Projects: Support"}
        visible={showDetailsSupport}
        onHide={disableShowDelegateDialogSupport}
        style={{ width: "98vw", height: "98vh" }}
        footer={renderFooter()} // Use the footer prop

      >
        {!isLoading ? (
          <div className="bg-white p-4 rounded-lg h-full flex flex-col justify-between">
            {/* This is the content of the dialog, which will only be rendered when projectData is not empty */}
            <div style={{ maxHeight: "85vh", overflow: "auto" }}> 
              <DataTable
                value={projectData}
                className="border rounded-md p-4 bg-white"
                dataKey="id"
              >
                <Column
                  headerStyle={{ width: "3rem" }}
                ></Column>
                <Column
                  field="title"
                  header="Project Title"
                  body={sentenceCaseFormatter}
                ></Column>
                
                <Column
                  field="start_date"
                  header="Start Date"
                 
                ></Column>
                <Column
                  field="end_date"
                  header="End Date"
                ></Column>
                  
                 <Column
                  field="clientname"
                  header="Client"
                  body={sentenceCaseFormatter}
                ></Column>
              </DataTable>
            </div>
          </div>
        ) : (
          <div>
            <i
              className="pi pi-spin pi-spinner"
              style={{ fontSize: "1.4rem" }}
            ></i>
          </div> // This will be rendered when projectData is empty
        )}
      </Dialog>
    </div>
  );
};

export default DetailsSupportDialog;
