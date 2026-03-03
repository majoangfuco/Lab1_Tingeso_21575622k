import React, { useEffect, useState } from "react";
import KardexService from "../services/KardexService";
import PropTypes from "prop-types";

const RentalDetailsModal = ({ isOpen, onClose, rental }) => {
  const [tools, setTools] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && rental) {
      fetchTools();
    } else {
      setTools([]);
    }
  }, [isOpen, rental]);

  const fetchTools = async () => {
    setLoading(true);

    try {
      const data = await KardexService.getToolsByRentalId(rental.rentalId);
      setTools(data);
    } catch (error) {
      console.error("Failed to load tools");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !rental) {
    return null;
  }

  // 🔹 Destructuring para evitar repetir rental.xxx
  const {
    rentalId,
    rentalDate,
    returnDate,
    rentalStatus,
    amountDue
  } = rental;

  function renderStatusBadge(status) {
    if (status === 1) {
      return (
        <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs">
          Overdue
        </span>
      );
    }

    if (status === 2) {
      return (
        <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
          Returned
        </span>
      );
    }

    return (
      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
        Active
      </span>
    );
  }

  function renderToolsContent() {
    if (loading) {
      return (
        <p className="text-center text-gray-500 py-4">
          Loading tools...
        </p>
      );
    }

    if (tools.length === 0) {
      return (
        <p className="text-center text-gray-400 py-4">
          No tools found for this rental.
        </p>
      );
    }

    return (
      <table className="w-full text-sm text-left">
        <thead className="text-xs text-gray-700 uppercase bg-gray-100">
          <tr>
            <th className="px-4 py-2" scope="col">Tool Name</th>
            <th className="px-4 py-2" scope="col">Brand</th>
            <th className="px-4 py-2" scope="col">Model</th>
            <th className="px-4 py-2" scope="col">ID</th>
          </tr>
        </thead>

        <tbody>
          {tools.map((tool) => (
            <tr key={tool.toolId} className="border-b">
              <td className="px-4 py-2 font-medium">
                {tool.informationTool?.nameTool}
              </td>
              <td className="px-4 py-2">
                {tool.informationTool?.brand}
              </td>
              <td className="px-4 py-2">
                {tool.informationTool?.model}
              </td>
              <td className="px-4 py-2 text-gray-500">
                {tool.toolId}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  function renderRentalInfo() {
    return (
      <div className="grid grid-cols-2 gap-4 mb-6 text-sm">

        <div>
          <p className="text-gray-500 font-semibold">Start Date</p>
          <p>{new Date(rentalDate).toLocaleString()}</p>
        </div>

        <div>
          <p className="text-gray-500 font-semibold">Expected Return</p>
          <p className={rentalStatus === 1 ? "text-red-600 font-bold" : ""}>
            {new Date(returnDate).toLocaleString()}
          </p>
        </div>

        <div>
          <p className="text-gray-500 font-semibold">Status</p>
          <div className="mt-1">
            {renderStatusBadge(rentalStatus)}
          </div>
        </div>

        <div>
          <p className="text-gray-500 font-semibold">Total Amount</p>
          <p className="font-bold text-gray-800">
            ${amountDue || 0}
          </p>
        </div>

      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">

      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6 relative animate-fade-in">

        <div className="flex justify-between items-center mb-4 border-b pb-2">
          <h2 className="text-xl font-bold text-gray-800">
            Rental Details #{rentalId}
          </h2>

          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            &times;
          </button>
        </div>

        {renderRentalInfo()}

        <h3 className="text-md font-bold text-gray-700 mb-2">
          Tools Included
        </h3>

        <div className="bg-gray-50 rounded border p-2 h-48 overflow-y-auto">
          {renderToolsContent()}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};

export default RentalDetailsModal;
RentalDetailsModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  rental: PropTypes.shape({
    rentalId: PropTypes.number.isRequired,
    rentalDate: PropTypes.number.isRequired,
    returnDate: PropTypes.number.isRequired,
    rentalStatus: PropTypes.number.isRequired,
    amountDue: PropTypes.number
  })
};