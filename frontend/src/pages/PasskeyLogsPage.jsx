import { useState, useMemo, useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { useNavigate } from "react-router-dom";
import { Eye, Filter, CalendarDays, ListChecks, AlertCircle, ArrowLeftIcon, Trash2 } from 'lucide-react';
import { createPortal } from 'react-dom';
import { useProductStore } from "../store/useProductStore";
import { createLogs } from '../funcs/essentialFuncs';
import { usePasskeyLogsStore } from '../store/usePasskeyLogsStore';
import { useGoogleAuthContext } from '../contexts/GoogleAuthContext';
import { useQuery } from "@tanstack/react-query";

const passkeyName = localStorage.getItem("passkeyName");
const passkey = localStorage.getItem("passkey");

// Function to determine severity based on activity type
const getSeverity = (activity) => {
  if (activity === 'Deleted') return 'high';
  if (activity === 'Modified') return 'medium';
  return 'low';
};

export default function PasskeyLogsPage() {
    const [dateFilter, setDateFilter] = useState('all');
    const [selectedLogs, setSelectedLogs] = useState([]);
    const [selectedLog, setSelectedLog] = useState(null);
    const { resetFormData } = useProductStore();
    const navigate = useNavigate();
    const pageLoadedRef = useRef(false);
    const { fetchPasskeyLogsNoRetries, passkeyLogs, loading, error } = usePasskeyLogsStore();
    const { gapi } = useGoogleAuthContext();

    useQuery({
        queryKey: ['passkey_logs'],
        queryFn: () => fetchPasskeyLogsNoRetries(gapi),
        refetchInterval: 1000 * 30
    });

    useEffect(() => {
        const pageLoaded = () => {
            if (pageLoadedRef.current) return;
            if (passkey) {
                createLogs("Accessed", `${passkeyName} entered the Passkey Logs Page`);
                pageLoadedRef.current = true;
            }
        }
        pageLoaded();
    }, []);

    // Transform passkeyLogs to match UI structure
    const transformedLogs = useMemo(() => {
        if (!passkeyLogs || !Array.isArray(passkeyLogs)) return [];
        
        return passkeyLogs.map(log => ({
            id: log.id.toString(),
            passkeyName: log.passkeyName,
            activity: log.activity,
            activityDetails: log.activityDetails,
            privileges: log.privileges,
            timestamp: new Date(log.date),
            severity: getSeverity(log.activity)
        }));
    }, [passkeyLogs]);

    const dateFilters = [
        { label: 'All', value: 'all' },
        { label: '1 Day', value: '1d' },
        { label: '7 Days', value: '7d' },
        { label: '2 Weeks', value: '14d' },
        { label: '1 Month', value: '30d' },
        { label: 'Over 1 Month', value: 'over30d' },
    ];

    const showLogDetails = (log) => {
        if (passkey) {
            createLogs("Accessed", `${passkeyName} viewed log details with passkeyName ${log.passkeyName}`);
        }
        setSelectedLog(log);
    };

    const LogDetailsModal = () => createPortal(
        <dialog className={`modal ${selectedLog ? 'modal-open' : ''}`}>
            <div className="modal-box max-w-xs md:max-w-md">
                <div className="flex items-start gap-3 mb-4">
                    <AlertCircle className={`w-6 h-6 ${selectedLog?.severity === 'high' ? 'text-error' :
                        selectedLog?.severity === 'medium' ? 'text-warning' : 'text-info'
                        }`} />
                    <div>
                        <h3 className="font-bold text-lg">{selectedLog?.activity} Event</h3>
                        <p className="text-sm text-gray-500">
                            {selectedLog?.timestamp.toLocaleString()}
                        </p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div>
                        <h4 className="font-semibold mb-2">Activity Details</h4>
                        <p className="text-sm bg-base-200 rounded-lg p-3">
                            {selectedLog?.activityDetails}
                        </p>
                    </div>

                    <div className="divider my-2"></div>

                    <div>
                        <h4 className="font-semibold mb-2">Associated Privileges</h4>
                        <div className="flex flex-wrap gap-2">
                            {selectedLog?.privileges?.map(privilege => (
                                <span
                                    key={privilege}
                                    className="badge badge-outline badge-sm md:badge-md"
                                >
                                    {privilege}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="modal-action">
                    <button
                        className="btn btn-sm md:btn-md"
                        onClick={() => setSelectedLog(null)}
                    >
                        Close
                    </button>
                </div>
            </div>
            <form method="dialog" className="modal-backdrop">
                <button onClick={() => setSelectedLog(null)}>close</button>
            </form>
        </dialog>,
        document.body
    );

    const TableRowActions = ({ log }) => (
        <div className="flex gap-1 md:gap-2">
            <button
                className="btn btn-circle btn-ghost btn-xs md:btn-sm"
                onClick={() => showLogDetails(log)}
                title="View details"
            >
                <Eye className="w-4 h-4 md:w-5 md:h-5" />
            </button>
            <button
                className="btn btn-circle btn-ghost btn-xs md:btn-sm text-error"
                onClick={() => deleteSingleLog(log.id)}
                title="Delete log"
            >
                <Trash2 className="w-4 h-4 md:w-5 md:h-5" />
            </button>
        </div>
    );

    const ActivityCell = ({ log }) => (
        <td className="hidden sm:table-cell">
            <div className="flex items-center gap-2">
                <span className={`badge badge-xs ${log.severity === 'high' ? 'badge-error' :
                    log.severity === 'medium' ? 'badge-warning' : 'badge-info'
                    }`}></span>
                {log.activity}
            </div>
        </td>
    );

    const filteredLogs = useMemo(() => {
        const now = new Date();
        return transformedLogs.filter(log => {
            const logDate = new Date(log.timestamp);
            const diffDays = Math.floor((now - logDate) / (1000 * 60 * 60 * 24));

            switch (dateFilter) {
                case '1d': return diffDays <= 1;
                case '7d': return diffDays <= 7;
                case '14d': return diffDays <= 14;
                case '30d': return diffDays <= 30;
                case 'over30d': return diffDays > 30;
                default: return true;
            }
        });
    }, [transformedLogs, dateFilter]);

    const toggleSelectAll = (e) => {
        setSelectedLogs(e.target.checked ? filteredLogs?.map(log => log.id) : []);
    };

    const deleteSelected = () => {
        if (!selectedLogs.length) return;

        if (passkey) {
            createLogs("Deleted", `${passkeyName} deleted ${selectedLogs.length} log(s)`);
        }

        // Placeholder for actual deletion logic
        toast.success(`${selectedLogs.length} log(s) marked for deletion`);
        setSelectedLogs([]);
    };

    const deleteSingleLog = (logId) => {
        if (passkey) {
            createLogs("Deleted", `${passkeyName} deleted log with id ${logId}`);
        }
        // Placeholder for actual deletion logic
        toast.success('Log entry marked for deletion');
    };

    return (
        <div className="p-4 md:p-8 max-w-6xl mx-auto bg-base-300/60 min-h-screen">
            <button
                onClick={() => {
                    resetFormData();
                    navigate(-1);
                }}
                className="btn btn-ghost mb-8"
            >
                <ArrowLeftIcon className="size-5 mr-2" />
                Back to Passkeys
            </button>
            
            {/* Header Section */}
            <div className="flex flex-col gap-4 mb-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-xl md:text-2xl font-bold flex items-center gap-2">
                        <ListChecks className="w-5 h-5 md:w-6 md:h-6" />
                        <span className="flex-nowrap text-nowrap whitespace-nowrap">Audit Logs</span>
                    </h1>

                    <div className="flex justify-between items-center w-full md:hidden">
                        {selectedLogs.length > 0 && (
                            <button
                                className="ml-auto btn btn-error btn-xs"
                                onClick={deleteSelected}
                            >
                                <Trash2 className="w-3 h-3" />
                                <span className="ml-1">Delete ({selectedLogs.length})</span>
                            </button>
                        )}
                        {/* Mobile Date Filter Dropdown */}
                        <div className="md:hidden dropdown dropdown-end z-10">
                            <label tabIndex={0} className="btn btn-sm btn-ghost">
                                <Filter className="w-4 h-4" />
                            </label>
                            <ul
                                tabIndex={0}
                                className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52"
                            >
                                {dateFilters?.map(filter => (
                                    <li key={filter.value}>
                                        <button
                                            onClick={() => setDateFilter(filter.value)}
                                            className={dateFilter === filter.value ? 'active' : ''}
                                        >
                                            {filter.label}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                    
                    {/* Delete Selected Button */}
                    {selectedLogs.length > 0 && (
                        <div className="hidden md:flex">
                            <button
                                className="btn btn-error btn-sm md:btn-md shadow-lg"
                                onClick={deleteSelected}
                            >
                                <Trash2 className="w-4 h-4 md:w-5 md:h-5 mr-1 md:mr-2" />
                                <span className="text-xs md:text-sm">
                                    Delete ({selectedLogs.length})
                                </span>
                            </button>
                        </div>
                    )}
                </div>
                
                {/* Desktop Date Filters */}
                <div className="hidden md:flex join">
                    {dateFilters?.map(filter => (
                        <button
                            key={filter.value}
                            onClick={() => setDateFilter(filter.value)}
                            className={`join-item btn btn-sm ${dateFilter === filter.value ? 'btn-primary' : 'btn-ghost'}`}
                        >
                            {filter.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Logs Table */}
            {filteredLogs.length === 0 ? (
                <div className="text-center py-12 md:py-20">
                    <CalendarDays className="mx-auto mb-4 text-gray-400 w-12 h-12 md:w-16 md:h-16" />
                    <p className="text-lg md:text-xl text-gray-500">No logs found for selected period</p>
                </div>
            ) : (
                <div className="overflow-x-auto rounded-box shadow-lg">
                    <table className="table table-zebra">
                        <thead>
                            <tr>
                                <th className="">
                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            className="checkbox checkbox-primary checkbox-xs md:checkbox-sm"
                                            checked={selectedLogs.length === filteredLogs.length}
                                            onChange={toggleSelectAll}
                                        />
                                        <span className="ml-2 text-xs md:text-sm hidden md:inline">Select All</span>
                                    </label>
                                </th>
                                <th className="text-sm md:text-base">Passkey</th>
                                <th className="text-sm md:text-base hidden sm:table-cell">Activity</th>
                                <th className="text-sm md:text-base">Date</th>
                                <th className="text-sm md:text-base">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredLogs?.map(log => (
                                <tr key={log.id} className="hover">
                                    <td className="sm:table-cell">
                                        <input
                                            type="checkbox"
                                            className="checkbox checkbox-primary checkbox-xs md:checkbox-sm"
                                            checked={selectedLogs.includes(log.id)}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setSelectedLogs(prev => [...prev, log.id]);
                                                } else {
                                                    setSelectedLogs(prev => prev.filter(id => id !== log.id));
                                                }
                                            }}
                                        />
                                    </td>
                                    <td>
                                        <div className="font-medium text-sm md:text-base">
                                            {log.passkeyName}
                                            <div className="text-xs text-gray-500 sm:hidden">
                                                {log.activity}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="hidden sm:table-cell"> <ActivityCell log={log} /></td>
                                    <td>
                                        <div className="text-sm md:text-base">
                                            {log.timestamp.toLocaleDateString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric'
                                            })}
                                            <div className="text-xs text-gray-500">
                                                {log.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <TableRowActions log={log} />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Privileges Modal */}
            <LogDetailsModal />
        </div>
    );
}