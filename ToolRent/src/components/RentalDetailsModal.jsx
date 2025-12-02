import React, { useEffect, useState } from 'react';
import KardexService from '../services/KardexService';

const RentalDetailsModal = ({ isOpen, onClose, rental }) => {
    const [tools, setTools] = useState([]);
    const [loading, setLoading] = useState(false);

    // Why: We implement "Lazy Loading" here. Instead of fetching all tool details for all rentals at once (huge data),
    // we only fetch the specific tools for THIS rental the moment the user actually asks to see them.
    useEffect(() => {
        if (isOpen && rental) {
            fetchTools();
        } else {
            // Why: Clear previous state ensures the user doesn't see "ghost" data from the last viewed rental while loading the new one.
            setTools([]); 
        }
    }, [isOpen, rental]);

    const fetchTools = async () => {
        setLoading(true);
        try {
            // ENDPOINT DATA: Fetches the associated items (One-to-Many relationship) using the Rental ID as the foreign key.
            const data = await KardexService.getToolsByRentalId(rental.rentalId);
            setTools(data);
        } catch (error) {
            console.error("Failed to load tools");
        } finally {
            setLoading(false);
        }
    };

    // Why: Performance optimization. If the modal is closed, we detach it from the DOM entirely.
    if (!isOpen || !rental) return null;

    // Why: Encapsulating visual logic (color coding) in a helper keeps the JSX clean and maintainable.
    const getStatusBadge = (status) => {
        if (status === 1) return <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs">Overdue</span>;
        if (status === 2) return <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">Returned</span>;
        return <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">Active</span>;
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6 relative animate-fade-in">
                
                <div className="flex justify-between items-center mb-4 border-b pb-2">
                    <h2 className="text-xl font-bold text-gray-800">Rental Details #{rental.rentalId}</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
                </div>

                {/* General Info Grid */}
                {/* Why: Grid layout allows key metrics to be scanned quickly in a dashboard-like format. */}
                <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                    <div>
                        <p className="text-gray-500 font-semibold">Start Date</p>
                        {/* Why: Converting raw timestamps (ISO/milliseconds) to user's local readable format. */}
                        <p>{new Date(rental.rentalDate).toLocaleString()}</p>
                    </div>
                    <div>
                        <p className="text-gray-500 font-semibold">Expected Return</p>
                        <p className={rental.rentalStatus === 1 ? 'text-red-600 font-bold' : ''}>
                            {new Date(rental.returnDate).toLocaleString()}
                        </p>
                    </div>
                    <div>
                        <p className="text-gray-500 font-semibold">Status</p>
                        <div className="mt-1">{getStatusBadge(rental.rentalStatus)}</div>
                    </div>
                    <div>
                        <p className="text-gray-500 font-semibold">Total Amount</p>
                        <p className="font-bold text-gray-800">${rental.amountDue || 0}</p>
                    </div>
                </div>

                <h3 className="text-md font-bold text-gray-700 mb-2">Tools Included</h3>
                {/* Why: 'h-48 overflow-y-auto' creates a contained scroll area. 
                    If a rental has 100 items, it won't stretch the modal off the screen. */}
                <div className="bg-gray-50 rounded border p-2 h-48 overflow-y-auto">
                    {loading ? (
                        <p className="text-center text-gray-500 py-4">Loading tools...</p>
                    ) : tools.length === 0 ? (
                        <p className="text-center text-gray-400 py-4">No tools found for this rental.</p>
                    ) : (
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                                <tr>
                                    <th className="px-4 py-2">Tool Name</th>
                                    <th className="px-4 py-2">Brand</th>
                                    <th className="px-4 py-2">Model</th>
                                    <th className="px-4 py-2">ID</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tools.map((tool) => (
                                    <tr key={tool.toolId} className="border-b">
                                        {/* Why: Optional chaining (?.) prevents crashes if the 'informationTool' object 
                                            is missing from the backend response due to a bad join. */}
                                        <td className="px-4 py-2 font-medium">{tool.informationTool?.nameTool}</td>
                                        <td className="px-4 py-2">{tool.informationTool?.brand}</td>
                                        <td className="px-4 py-2">{tool.informationTool?.model}</td>
                                        <td className="px-4 py-2 text-gray-500">{tool.toolId}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
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