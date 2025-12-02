import React from 'react';
import { getKardexStatus, formatDate } from '../utils/KardexUtils';

const KardexTable = ({ data }) => {
    // Why: Early exit prevents rendering an empty table shell, providing clear feedback to the user immediately.
    if (data.length === 0) {
        return <p className="text-center text-gray-500 mt-4">No records found for this period.</p>;
    }

    return (
        // Why: 'overflow-x-auto' ensures the table remains accessible on smaller screens by enabling horizontal scrolling
        // instead of breaking the page layout.
        <div className="overflow-x-auto bg-white rounded shadow">
            <table className="min-w-full text-left text-sm whitespace-nowrap">
                <thead className="uppercase tracking-wider border-b-2 border-gray-200 bg-gray-50">
                    <tr>
                        <th className="px-6 py-3" scope="col">Date</th>
                        <th className="px-6 py-3" scope="col">Tool Name</th>
                        <th className="px-6 py-3" scope="col">Movement Type</th>
                        <th className="px-6 py-3" scope="col">Responsible</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((item) => {
                        // Why: Abstraction via helper function centralizes logic for color coding statuses,
                        // making it easier to update visual rules in one place rather than in every table component.
                        const status = getKardexStatus(item.kardexType);
                        return (
                            <tr key={item.kardexId} className="border-b hover:bg-gray-50">
                                <td className="px-6 py-4">{formatDate(item.kardexDate)}</td>
                                {/* ENDPOINT DATA: Accessing nested object properties (item.tool.nameTool) assumes data integrity from the backend join. */}
                                <td className="px-6 py-4 font-medium">{item.tool.nameTool}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${status.color}`}>
                                        {status.label}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-gray-500">
                                    {/* Why: Sanitizes technical DB values (like UUIDs or system flags) into user-friendly labels. */}
                                    {item.createdByUserId === 'system-auto' ? 'System' : 'User/Admin'}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

export default KardexTable;