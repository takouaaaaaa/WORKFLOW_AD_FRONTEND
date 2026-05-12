import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";

import {
  getFileIns,
  downloadFileIn,
  updateFileIn,
  forceFileIn,
  rejectFileIn,
} from "../services/fileInService";

import http from "../../../services/http";

import FileInFilters from "../components/FileInFilters";
import FileInTable from "../components/FileInTable";
import FileInViewModal from "../components/FileInViewModal";
import FileInEditModal from "../components/FileInEditModal";

import "../styles/FileInpage.css";

const ITEMS_PER_PAGE = 10;

export default function FileInPage() {

  const location = useLocation();
  const urlStatus = location.state?.status || "";

  const [rows, setRows] = useState([]);
  const [filteredRows, setFilteredRows] = useState([]);

  const [senders, setSenders] = useState([]);
  const [receivers, setReceivers] = useState([]);
  const [flowTypes, setFlowTypes] = useState([]);

  const [senderOptions, setSenderOptions] = useState([]);
  const [receiverOptions, setReceiverOptions] = useState([]);
  const [flowTypeOptions, setFlowTypeOptions] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);

  const [selectedRow, setSelectedRow] = useState(null);

  const [showView, setShowView] = useState(false);
  const [showEdit, setShowEdit] = useState(false);

  const [editData, setEditData] = useState({});

  const [filters, setFilters] = useState({
    appReference: "",
    senderReference: "",
    status: urlStatus,
    category: "",
    sender: "",
    receiver: "",
    flowType: "",
    sendingDateFrom: "",
    sendingDateTo: "",
    totalAmountFrom: "",
    totalAmountTo: "",
  });

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {

      const [
        fileInRes,
        senderRes,
        receiverRes,
        flowTypeRes,
      ] = await Promise.all([
        getFileIns(),
        http.get("/sender"),
        http.get("/receiver"),
        http.get("/typeflux"),
      ]);

      const fileIns = Array.isArray(fileInRes.data)
        ? fileInRes.data
        : fileInRes.data.content || [];

      const senderData = senderRes.data || [];
      const receiverData = receiverRes.data || [];
      const flowTypeData = flowTypeRes.data || [];

      setRows(fileIns);

      setSenders(senderData);
      setReceivers(receiverData);
      setFlowTypes(flowTypeData);

      setSenderOptions(
        senderData.map((s) => s.sender).sort()
      );

      setReceiverOptions(
        receiverData.map((r) => r.receiver).sort()
      );

      setFlowTypeOptions(
        flowTypeData.map((f) => f.FlowType).sort()
      );

      if (urlStatus) {
        setFilteredRows(
          fileIns.filter(
            (row) =>
              (row?.status || "").toUpperCase() ===
              urlStatus.toUpperCase()
          )
        );
      } else {
        setFilteredRows(fileIns);
      }

    } catch (error) {
      console.error(error);
      alert("Failed to load data");
    }
  };

  const getSenderName = (senderId) => {
    const sender = senders.find(
      (s) => s.idSender === senderId
    );

    return sender?.sender || "";
  };

  const getReceiverName = (receiverId) => {
    const receiver = receivers.find(
      (r) => r.idReceiver === receiverId
    );

    return receiver?.receiver || "";
  };

  const getFlowTypeName = (flowTypeId) => {
    const flowType = flowTypes.find(
      (f) => f.idTypeFlux === flowTypeId
    );

    return flowType?.FlowType || "";
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSearch = () => {

    const result = rows.filter((row) => {

      const appRef =
        (row?.appReference || "")
          .toLowerCase();

      const senderRef =
        (row?.flux?.senderReference || "")
          .toLowerCase();

      const status =
        (row?.status || "")
          .toUpperCase();

      const category =
        (row?.category || "")
          .toUpperCase();

      const senderName =
        getSenderName(row?.flux?.sender);

      const flowTypeName =
        getFlowTypeName(row?.flux?.typeFlux);

      const sendingDate =
        row?.sendingDate
          ? new Date(row.sendingDate)
          : null;

      const amount =
        row?.flux?.totalAmount != null
          ? Number(row.flux.totalAmount)
          : null;

      if (
        filters.appReference &&
        !appRef.includes(
          filters.appReference.toLowerCase()
        )
      ) {
        return false;
      }

      if (
        filters.senderReference &&
        !senderRef.includes(
          filters.senderReference.toLowerCase()
        )
      ) {
        return false;
      }

      if (
        filters.status &&
        status !== filters.status.toUpperCase()
      ) {
        return false;
      }

      if (
        filters.category &&
        category !== filters.category.toUpperCase()
      ) {
        return false;
      }

      if (
        filters.sender &&
        senderName !== filters.sender
      ) {
        return false;
      }

      if (
        filters.flowType &&
        flowTypeName !== filters.flowType
      ) {
        return false;
      }

      if (
        filters.sendingDateFrom ||
        filters.sendingDateTo
      ) {

        if (!sendingDate) return false;

        if (
          filters.sendingDateFrom &&
          sendingDate <
            new Date(filters.sendingDateFrom)
        ) {
          return false;
        }

        if (filters.sendingDateTo) {

          const endDate = new Date(
            filters.sendingDateTo
          );

          endDate.setHours(
            23,
            59,
            59,
            999
          );

          if (sendingDate > endDate) {
            return false;
          }
        }
      }

      if (
        filters.totalAmountFrom ||
        filters.totalAmountTo
      ) {

        if (amount == null) return false;

        if (
          filters.totalAmountFrom &&
          amount <
            Number(filters.totalAmountFrom)
        ) {
          return false;
        }

        if (
          filters.totalAmountTo &&
          amount >
            Number(filters.totalAmountTo)
        ) {
          return false;
        }
      }

      return true;
    });

    setFilteredRows(result);

    setCurrentPage(1);

    setSelectedRow(null);
  };

  const handleReset = () => {

    setFilters({
      appReference: "",
      senderReference: "",
      status: "",
      category: "",
      sender: "",
      receiver: "",
      flowType: "",
      sendingDateFrom: "",
      sendingDateTo: "",
      totalAmountFrom: "",
      totalAmountTo: "",
    });

    setFilteredRows(rows);

    setCurrentPage(1);

    setSelectedRow(null);
  };

  const totalPages =
    Math.ceil(
      filteredRows.length / ITEMS_PER_PAGE
    ) || 1;

  const paginatedRows = useMemo(() => {

    const start =
      (currentPage - 1) * ITEMS_PER_PAGE;

    return filteredRows.slice(
      start,
      start + ITEMS_PER_PAGE
    );

  }, [filteredRows, currentPage]);

  return (
    <div className="filein-page-bootstrap">

      <FileInFilters
        filters={filters}
        onChange={handleFilterChange}
        onReset={handleReset}
        onSearch={handleSearch}
        senderOptions={senderOptions}
        receiverOptions={receiverOptions}
        flowTypeOptions={flowTypeOptions}
      />

      <FileInTable
        rows={paginatedRows}
        totalCount={filteredRows.length}
        selectedRow={selectedRow}
        setSelectedRow={setSelectedRow}
      />

    </div>
  );
}