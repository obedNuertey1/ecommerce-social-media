import { useState, useMemo, useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { Trash2, Eye, Filter, CalendarDays, ListChecks, AlertCircle, ArrowLeftIcon } from 'lucide-react';
import { createPortal } from 'react-dom';
import { useNavigate } from "react-router-dom";
import { useProductStore } from "../store/useProductStore";
import { createLogs } from '../funcs/essentialFuncs';
import { usePasskeyLogsStore } from '../store/usePasskeyLogsStore';
import { useGoogleAuthContext } from '../contexts/GoogleAuthContext';
import { useQuery } from "@tanstack/react-query";

const passkeyName = localStorage.getItem("passkeyName");
const passkey = localStorage.getItem("passkey");

export default function PasskeyLogsPage() {
    const [dateFilter, setDateFilter] = useState('all');
    const [selectedLogs, setSelectedLogs] = useState([]);
    const [selectedLog, setSelectedLog] = useState(null);
    const { resetFormData } = useProductStore();
    const navigate = useNavigate();
    const pageLoadedRef = useRef(false);
    const { fetchPasskeyLogsNoRetries, passkeyLogs, loading, error } = usePasskeyLogsStore();
    const { gapi } = useGoogleAuthContext()

    const { data } = useQuery({
        queryKey: ['orders'],
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
        return () => { };
    }, []);

    console.log({passkeyLogs});

    // Mock log data
    // logs is the same as passkeyLogs gotten from usePasskeyLogsStore
    const [logs, setLogs] = useState(() => {
        const sampleLogs = [];
        const activities = ['Created', 'Modified', 'Deleted', 'Accessed'];
        const passkeyNames = ['Admin Key', 'User Key', 'API Key', 'Backup Key'];
        const resources = ['Product', 'User', 'Order', 'Settings'];

        for (let i = 0; i < 15; i++) {
            const activityIndex = i % 4;
            const details = {
                Created: `Created new ${resources[i % 4]} "${i % 2 === 0 ? 'Guitar' : 'Piano'}" (ID: ${i + 100})`,
                Modified: `Updated ${resources[i % 4]} settings (ID: ${i + 200})`,
                Deleted: `Deleted ${resources[i % 4]} "${i % 3 === 0 ? 'Old Inventory' : 'User Account'}" (ID: ${i + 300})`,
                Accessed: `Viewed sensitive ${resources[i % 4]} data (ID: ${i + 400})`
            }[activities[activityIndex]];

            sampleLogs.push({
                id: crypto.randomUUID(),
                passkeyName: passkeyNames[i % 4],
                activity: activities[activityIndex],
                activityDetails: details,
                privileges: ['view-only', 'moderate', 'full-access'].slice(0, (i % 3) + 1),
                timestamp: new Date(Date.now() - (i * 86400000 * 2)),
                severity: ['low', 'medium', 'high'][i % 3]
            });
        }
        return sampleLogs;
    });

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

    // Updated table cell for activity with severity indicator
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
        return logs.filter(log => {
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
    }, [logs, dateFilter]);

    const toggleSelectAll = (e) => {
        setSelectedLogs(e.target.checked ? filteredLogs.map(log => log.id) : []);
    };

    const deleteSelected = () => {
        if (!selectedLogs.length) return;

        if (passkey) {
            createLogs("Deleted", `${passkeyName} deleted ${selectedLogs.length} log(s)`);
        }

        setLogs(prev => prev.filter(log => !selectedLogs.includes(log.id)));
        setSelectedLogs([]);
        toast.success(`${selectedLogs.length} log(s) deleted successfully`);
    };

    const deleteSingleLog = (logId) => {
        if (passkey) {
            createLogs("Deleted", `${passkeyName} deleted log with id ${logId}`);
        }
        setLogs(prev => prev.filter(log => log.id !== logId));
        toast.success('Log entry deleted successfully');
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
                    </div>
                    {/* Mobile Date Filter Dropdown */}
                    <div className="md:hidden dropdown dropdown-end z-10">
                        <label tabIndex={0} className="btn btn-sm btn-ghost">
                            <Filter className="w-4 h-4" />
                        </label>
                        <ul
                            tabIndex={0}
                            className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52"
                        >
                            {dateFilters.map(filter => (
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
                    {dateFilters.map(filter => (
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
                            {filteredLogs.map(log => (
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
                                            })}
                                            <span className="hidden md:inline">
                                                , {log.timestamp.getFullYear()}
                                            </span>
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