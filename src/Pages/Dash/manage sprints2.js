<div className="flex flex-col p-5 md:space-y-8 space-y-4 h-full mb-12 overflow-auto">
<Toast ref={toast} />
<div className="flex flex-col md:flex-row md:space-x-8 space-y-4 md:space-y-0 flex-grow ">
  <div className="flex-1 p-4">
    <Card
      title={titleTemplate}
      className="rounded shadow-md h-full p-2"
      style={{ backgroundColor: "hsl(214, 41%, 97%)" }}
      header={headerTemplate}
    >
      <div className="flex justify-center items-center h-full text-black-500">
        <p className="text-2xl font-semibold">
          {projectImplementationCount}
        </p>
      </div>

      {/* "View More" link */}
      <p
        className="text-xl md:absolute bottom-2 right-2 text-blue-400 hover:text-blue-600 cursor-pointer"
        onClick={() => showDetailsDialogImplementation()}
      >
        View More
      </p>
    </Card>
  </div>

  <div className="flex-1 p-4">
    <Card
      title={titleTemplateSupport}
      className="rounded shadow-md h-full relative p-2"
      style={{ backgroundColor: "hsl(214, 41%, 97%)" }}
      header={headerTemplateSupport}
    >
      <div className="flex justify-center items-center h-full text-black-500">
        <p className="text-2xl font-semibold">{projectsSupportCount}</p>
      </div>

      {/* "View More" link */}
      <p
        className="text-xl  md:absolute bottom-2 right-2 text-blue-400 hover:text-blue-600 cursor-pointer"
        onClick={() => showDetailsDialogSupport()}
      >
        View More
      </p>
    </Card>
  </div>

  <div className="flex-1 p-4">
    <Card
      title={titleTemplateArchived}
      className="rounded shadow-md h-full relative p-2"
      style={{ backgroundColor: "hsl(214, 41%, 97%)" }}
      header={headerTemplateArchivedProjects}
    >
      <div className="flex justify-center items-center h-full text-black-500">
        <p className="text-2xl font-semibold">{projectsArchivedCount}</p>
      </div>

      {/* "View More" link */}
      <p
        className="text-xl md:absolute bottom-2 right-2 text-blue-400 hover:text-blue-600 cursor-pointer"
        onClick={() => showDetailsArchiveSupport()}
      >
        View More
      </p>
    </Card>
  </div>
</div>

<div className="flex-1 p-4">
  <div
    className="rounded shadow-md p-4"
    style={{ backgroundColor: "hsl(214, 41%, 97%)" }}
  >
    <p className="text-xl font-semibold mb-2 text-black-500">
      Project Subtasks in Active Sprint
    </p>
    <div className="h-full">
      <Chart
        className="h-80"
        type="bar"
        data={chartDataSubtsaks}
        options={chartOptions}
      />
    </div>
  </div>
</div>

{/* <div className="flex flex-col md:flex-row md:space-x-8 space-y-4 md:space-y-0 flex-grow mb-8"> */}

  {/* Place for graphs and other content */}

  <div className="flex-1 p-4 ">
    <div
      className="rounded shadow-md p-4 flex-grow relative"
      style={{ backgroundColor: "hsl(214, 41%, 97%)" }}
    >
      <p className="text-xl font-semibold mb-2 text-black-500">
        Project and Phases Details
      </p>
      <p className="text-xl mb-2 text-black-500">
        Sprint Name: {_.startCase(activeSprint.name)}
      </p>
      <p className="text-xl mb-2 text-black-500">
        Start Date: {activeSprint.startDate}
      </p>
      <p className="text-xl mb-12 text-black-500">
        End Date: {activeSprint.endDate}
      </p>
      <p className="text-xl md:absolute bottom-2 left-2 bg-green-500 text-white rounded-xl p-2 hover:bg-green-600">
        Status: {_.startCase(activeSprint.status)}
      </p>
      <p
        className="text-xl md:absolute bottom-2 right-2 text-blue-400 hover:text-blue-600 cursor-pointer"
        onClick={() => showDetailsDialog()}
      >
        View More
      </p>
    </div>
  </div>

  <div className="flex-1 p-4">
  <div
    className="rounded shadow-md p-4"
    style={{ backgroundColor: "hsl(214, 41%, 97%)" }}
  >
    <p className="text-xl font-semibold mb-2 text-black-500">
       Active Sprint Burned Down chart
    </p>
    <div className="h-full">
      <Chart
        className="h-80"
        type="bar"
        data={chartLineDataSubtsaks}
        options={chartOptionsStacked}
      />
    </div>
  </div>
</div>

</div>
) : (
<div className="flex justify-center items-center h-24">
<i className="pi pi-spin pi-spinner text-blue-500 md:text-4xl text-3xl"></i>
</div>
);