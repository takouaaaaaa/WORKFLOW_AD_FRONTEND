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

const getRowId = (row) => row?.idFlux || row?.idFluxIn || row?.id;

const getSenderName = (item) => {
  if (!item) return "";
  if (typeof item === "string") return item;

  return (
    item.sender ||
    item.senderName ||
    item.name ||
    item.code ||
    item.label ||
    ""
  );
};

const getSenderId = (item) => {
  if (!item || typeof item === "string") return "";

  return item.id || item.senderId || item.idSender || "";
};

const getRowSenderName = (row) =>
  row?.senderName ||
  row?.sender ||
  row?.sender?.sender ||
  row?.sender?.senderName ||
  row?.flux?.sender?.sender ||
  "";

const getRowSenderId = (row) =>
  row?.senderId ||
  row?.idSender ||
  row?.sender?.id ||
  row?.sender?.idSender ||
  row?.flux?.sender?.idSender ||
  "";

const getFlowTypeValue = (item) => {
  if (!item) return "";
  if (typeof item === "string") return item;

  return (
    item.flowType ||
    item.FlowType ||
    item.name ||
    item.type ||
    item.code ||
    ""
  );
};

const getFlowTypeId = (item) => {
  if (!item || typeof item === "string") return "";

  return item.id || item.idTypeFlux || item.typeFluxId || "";
};

const getRowFlowTypeName = (row) =>
  row?.flowType ||
  row?.typeFlux?.flowType ||
  row?.typeFlux?.FlowType ||
  row?.flux?.typeFlux?.flowType ||
  "";

const getRowTypeFluxId = (row) =>
  row?.typeFluxId ||
  row?.idTypeFlux ||
  row?.typeFlux?.id ||
  row?.typeFlux?.idTypeFlux ||
  row?.flux?.typeFlux?.idTypeFlux ||
  "";

const normalizeDateTimeLocalToIso = (value) => {
  if (!value) return null;

  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;

  return d.toISOString();
};

export default function FileInPage() {
  const location = useLocation();

  const urlStatus = location.state?.status || "";
  const urlSenderReference = location.state?.senderReference || "";

  const [rows, setRows] = useState([]);
  const [filteredRows, setFilteredRows] = useState([]);

  const [senderOptions, setSenderOptions] = useState([]);
  const [flowTypeOptions, setFlowTypeOptions] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRow, setSelectedRow] = useState(null);

  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState({});

  const [loading, setLoading] = useState(true);

  const [modal, setModal] = useState({
    show: false,
    type: "info",
    title: "",
    message: "",
    onConfirm: null,
  });

  const [filters, setFilters] = useState({
    appReference: "",
    senderReference: urlSenderReference,
    status: urlStatus,
    category: "",
    sender: "",
    flowType: "",
    sendingDateFrom: "",
    sendingDateTo: "",
    totalAmountFrom: "",
    totalAmountTo: "",
  });

  useEffect(() => {
    fetchAllData();
  }, []);

  const openModal = ({
    type = "info",
    title = "",
    message = "",
    onConfirm = null,
  }) => {
    setModal({
      show: true,
      type,
      title,
      message,
      onConfirm,
    });
  };

  const closeModal = () => {
    setModal({
      show: false,
      type: "info",
      title: "",
      message: "",
      onConfirm: null,
    });
  };

  const hydrateRows = (fileIns, senderData, flowTypeData) => {
    const senderById = new Map(
      senderData
        .map((s) => [String(getSenderId(s)), getSenderName(s)])
        .filter(([id, name]) => id && name)
    );

    const flowTypeById = new Map(
      flowTypeData
        .map((f) => [String(getFlowTypeId(f)), getFlowTypeValue(f)])
        .filter(([id, name]) => id && name)
    );

    return fileIns.map((row) => {
      const senderId = getRowSenderId(row);
      const typeFluxId = getRowTypeFluxId(row);

      return {
        ...row,
        id: getRowId(row),
        senderId,
        typeFluxId,
        senderName:
          getRowSenderName(row) ||
          senderById.get(String(senderId)) ||
          "—",
        flowType:
          getRowFlowTypeName(row) ||
          flowTypeById.get(String(typeFluxId)) ||
          "—",
      };
    });
  };

  const fetchAllData = async () => {
    try {
      setLoading(true);

      const [fileInRes, senderRes, flowTypeRes] = await Promise.all([
        getFileIns(),
        http.get("/senders"),
        http.get("/typeflux"),
      ]);

      const rawFileIns = Array.isArray(fileInRes.data)
        ? fileInRes.data
        : fileInRes.data?.content || [];

      const senderData = Array.isArray(senderRes.data)
        ? senderRes.data
        : senderRes.data?.content || [];

      const flowTypeData = Array.isArray(flowTypeRes.data)
        ? flowTypeRes.data
        : flowTypeRes.data?.content || [];

      const fileIns = hydrateRows(rawFileIns, senderData, flowTypeData);

      setRows(fileIns);
      setSenderOptions(senderData);
      setFlowTypeOptions(flowTypeData);

      let initialFiltered = fileIns;

      if (urlSenderReference) {
        initialFiltered = initialFiltered.filter((row) =>
          String(row?.senderReference || "")
            .toLowerCase()
            .includes(urlSenderReference.toLowerCase())
        );
      }

      if (urlStatus) {
        initialFiltered = initialFiltered.filter(
          (row) =>
            String(row?.status || "").toUpperCase() ===
            urlStatus.toUpperCase()
        );
      }

      setFilteredRows(initialFiltered);
    } catch (error) {
      console.error(error);
      alert("Failed to load data");
    } finally {
      setLoading(false);
    }
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
      const appRef = (row?.appReference || "").toLowerCase();
      const senderRef = (row?.senderReference || "").toLowerCase();
      const status = (row?.status || "").toUpperCase();
      const category = (row?.category || "").toUpperCase();
      const senderName = getRowSenderName(row);
      const flowTypeName = getRowFlowTypeName(row);
      const sendingDate = row?.sendingDate ? new Date(row.sendingDate) : null;
      const amount = row?.totalAmount != null ? Number(row.totalAmount) : null;

      if (
        filters.appReference &&
        !appRef.includes(filters.appReference.toLowerCase())
      ) {
        return false;
      }

      if (
        filters.senderReference &&
        !senderRef.includes(filters.senderReference.toLowerCase())
      ) {
        return false;
      }

      if (filters.status && status !== filters.status.toUpperCase()) {
        return false;
      }

      if (filters.category && category !== filters.category.toUpperCase()) {
        return false;
      }

      if (filters.sender && senderName !== filters.sender) {
        return false;
      }

      if (filters.flowType && flowTypeName !== filters.flowType) {
        return false;
      }

      if (filters.sendingDateFrom || filters.sendingDateTo) {
        if (!sendingDate) return false;

        if (
          filters.sendingDateFrom &&
          sendingDate < new Date(filters.sendingDateFrom)
        ) {
          return false;
        }

        if (filters.sendingDateTo) {
          const endDate = new Date(filters.sendingDateTo);
          endDate.setHours(23, 59, 59, 999);

          if (sendingDate > endDate) {
            return false;
          }
        }
      }

      if (filters.totalAmountFrom || filters.totalAmountTo) {
        if (amount == null) return false;

        if (
          filters.totalAmountFrom &&
          amount < Number(filters.totalAmountFrom)
        ) {
          return false;
        }

        if (filters.totalAmountTo && amount > Number(filters.totalAmountTo)) {
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

  const handleView = (row) => {
    setSelectedRow(row);
    setShowViewModal(true);
  };

  const handleEdit = (row) => {
    setSelectedRow(row);

    setEditData({
      ...row,
      id: getRowId(row),
      senderId: getRowSenderId(row),
      senderName: getRowSenderName(row),
      flowType: getRowFlowTypeName(row),
      typeFluxId: getRowTypeFluxId(row),
    });

    setShowEditModal(true);
  };

  const handleDownload = async (row) => {
    try {
      const id = getRowId(row);

      if (!id) {
        alert("File IN ID not found");
        return;
      }

      const res = await downloadFileIn(id);

      const blob = new Blob([res.data]);
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `${row.appReference || "filein"}.pdf`;

      document.body.appendChild(a);
      a.click();
      a.remove();

      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
      alert("Download failed");
    }
  };

  const handleSaveEdit = async () => {
    try {
      const id = getRowId(selectedRow) || editData.id;

      if (!id) {
        openModal({
          type: "error",
          title: "Error",
          message: "File IN ID not found",
        });
        return;
      }

      const payload = {
        status: editData.status || null,
        category: editData.category || null,
        descriptionFileIn: editData.descriptionFileIn || null,
        senderReference: editData.senderReference || null,
        totalAmount:
          editData.totalAmount === "" || editData.totalAmount == null
            ? null
            : Number(editData.totalAmount),
        sendingDate: normalizeDateTimeLocalToIso(editData.sendingDate),
        settlementDate: normalizeDateTimeLocalToIso(editData.settlementDate),
      };

      if (editData.senderId && Number(editData.senderId) > 0) {
        payload.sender = {
          idSender: Number(editData.senderId),
        };
      }

      if (editData.typeFluxId && Number(editData.typeFluxId) > 0) {
        payload.typeFlux = {
          idTypeFlux: Number(editData.typeFluxId),
        };
      }

      console.log("UPDATE FILEIN ID =", id);
      console.log("UPDATE FILEIN PAYLOAD =", payload);

      await updateFileIn(id, payload);

      setShowEditModal(false);
      setEditData({});
      setSelectedRow(null);

      await fetchAllData();

      openModal({
        type: "success",
        title: "Updated",
        message: "File IN updated successfully",
      });
    } catch (error) {
      console.error("UPDATE FILEIN ERROR =", error.response?.data || error);

      openModal({
        type: "error",
        title: "Update Failed",
        message: "Unable to update File IN",
      });
    }
  };

  const handleForce = async (row) => {
    openModal({
      type: "confirm",
      title: "Force File IN",
      message: "Are you sure you want to force this File IN?",
      onConfirm: async () => {
        try {
          const id = getRowId(row);

          if (!id) {
            openModal({
              type: "error",
              title: "Error",
              message: "File IN ID not found",
            });
            return;
          }

          await forceFileIn(id);
          await fetchAllData();

          openModal({
            type: "success",
            title: "Success",
            message: "File IN forced successfully",
          });
        } catch (error) {
          console.error(error);

          openModal({
            type: "error",
            title: "Force Failed",
            message: "Unable to force File IN",
          });
        }
      },
    });
  };

  const handleReject = async (row) => {
    openModal({
      type: "confirm",
      title: "Reject File IN",
      message: "Are you sure you want to reject this File IN?",
      onConfirm: async () => {
        try {
          const id = getRowId(row);

          if (!id) {
            openModal({
              type: "error",
              title: "Error",
              message: "File IN ID not found",
            });
            return;
          }

          await rejectFileIn(id);
          await fetchAllData();

          openModal({
            type: "success",
            title: "Rejected",
            message: "File IN rejected successfully",
          });
        } catch (error) {
          console.error(error);

          openModal({
            type: "error",
            title: "Reject Failed",
            message: "Unable to reject File IN",
          });
        }
      },
    });
  };

  const totalPages = Math.ceil(filteredRows.length / ITEMS_PER_PAGE) || 1;

  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredRows.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredRows, currentPage]);

  return (
    <div className="filein-page-bootstrap">
      {(urlStatus || urlSenderReference) && (
        <div className="filein-status-banner">
          {urlStatus && (
            <>
              Filtered by status: <strong>{urlStatus}</strong>
            </>
          )}

          {urlSenderReference && (
            <>
              Filtered by sender reference:{" "}
              <strong>{urlSenderReference}</strong>
            </>
          )}

          <span className="filein-status-count">
            {filteredRows.length} result(s)
          </span>
        </div>
      )}

      <FileInFilters
        filters={filters}
        onChange={handleFilterChange}
        onReset={handleReset}
        onSearch={handleSearch}
        senderOptions={senderOptions.map(getSenderName).filter(Boolean)}
        flowTypeOptions={flowTypeOptions.map(getFlowTypeValue).filter(Boolean)}
      />

      <div className="filein-card">
        <div className="filein-card-title">
          <span>
            Search Result : <span className="accent">File IN</span>
          </span>

          <span className="filein-results-badge">
            {loading
              ? "Loading..."
              : filteredRows.length === rows.length
              ? `${rows.length.toLocaleString()} total`
              : `${filteredRows.length.toLocaleString()} results`}
          </span>
        </div>

        <FileInTable
          rows={paginatedRows}
          selectedRow={selectedRow}
          setSelectedRow={setSelectedRow}
          loading={loading}
          onView={handleView}
          onEdit={handleEdit}
          onDownload={handleDownload}
          onForce={handleForce}
          onReject={handleReject}
        />

        <div className="filein-footer filein-footer-actions">
          <div className="filein-pagination">
            <button
              type="button"
              className="filein-btn-page"
              disabled={currentPage === 1 || loading}
              onClick={() => setCurrentPage((prev) => prev - 1)}
            >
              Previous
            </button>

            <span>
              Page {currentPage} / {totalPages}
            </span>

            <button
              type="button"
              className="filein-btn-page"
              disabled={currentPage === totalPages || loading}
              onClick={() => setCurrentPage((prev) => prev + 1)}
            >
              Next
            </button>
          </div>

          {selectedRow && (
            <div className="filein-selected-actions">
              <button
                className="filein-btn-view"
                onClick={() => handleView(selectedRow)}
              >
                View
              </button>

              <button
                className="filein-btn-edit"
                onClick={() => handleEdit(selectedRow)}
              >
                Edit
              </button>

              <button
                className="filein-btn-download"
                onClick={() => handleDownload(selectedRow)}
              >
                Download
              </button>

              <button
                className="filein-btn-force"
                onClick={() => handleForce(selectedRow)}
              >
                Force
              </button>

              <button
                className="filein-btn-danger"
                onClick={() => handleReject(selectedRow)}
              >
                Reject
              </button>
            </div>
          )}
        </div>
      </div>

      <FileInViewModal
        show={showViewModal}
        onClose={() => setShowViewModal(false)}
        selectedRow={selectedRow}
        formatDate={(date) => {
          if (!date) return "—";

          return new Date(date).toLocaleString("fr-FR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          });
        }}
      />

      <FileInEditModal
        show={showEditModal}
        onClose={() => setShowEditModal(false)}
        editData={editData}
        setEditData={setEditData}
        onSave={handleSaveEdit}
        flowTypeOptions={flowTypeOptions}
        senderOptions={senderOptions}
      />

      {modal.show && (
        <div className="custom-modal-overlay">
          <div className="custom-modal">
            <div className={`custom-modal-icon ${modal.type}`}>
              {modal.type === "success" && "✓"}
              {modal.type === "error" && "✕"}
              {modal.type === "confirm" && "?"}
            </div>

            <h3>{modal.title}</h3>

            <p>{modal.message}</p>

            <div className="custom-modal-actions">
              {modal.type === "confirm" ? (
                <>
                  <button className="modal-btn cancel" onClick={closeModal}>
                    Cancel
                  </button>

                  <button
                    className="modal-btn confirm"
                    onClick={async () => {
                      const fn = modal.onConfirm;
                      closeModal();

                      if (fn) {
                        await fn();
                      }
                    }}
                  >
                    Confirm
                  </button>
                </>
              ) : (
                <button className="modal-btn confirm" onClick={closeModal}>
                  OK
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}