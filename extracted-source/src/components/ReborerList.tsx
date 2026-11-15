{/* Actions */}
                    {activerebId === reb.id && (
                    <div className="flex items-center gap-2 self-start shrink-0">
                      <button onClick={() => onEditReborer(reb.id)} className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white">EDIT</button>
                      <button onClick={() => setDeleteConfirm({ isOpen: true, reborerId: reb.id, repoweringName: reb.repoweringName })} className="rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white">DELETE</button>
                    </div>
                  )}
                  </div>

                  {/* Work in Employee Bar */}
                  <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                    <button
                      onClick={() =>
                        setExpandedReborerId(isExpanded ? null : reb.id)
                      }
                      className="text-emerald-800 hover:text-emerald-950 font-semibold flex items-center gap-1.5"
                    >
                      <Users className="w-3.5 h-3.5 text-emerald-700" />
                      <span>
                        {linkedEmployees.length === 0
                          ? '0 Employees Assigned'
                          : `${linkedEmployees.length} Employee(s) Working`}
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5" />
                      )}
                    </button>

                    <button
                      onClick={() => setActiveReborerForModal(reb)}
                      className="text-xs text-emerald-700 font-semibold hover:underline"
                    >
                      Manage Staff Link
                    </button>
                  </div>
                </div>

                {/* Expanded Employees List */}
                {isExpanded && (
                  <div className="bg-emerald-50/50 p-4 border-t border-emerald-100 space-y-2">
                    <h4 className="text-xs font-bold text-emerald-950 uppercase tracking-wider mb-2">
                      Work In Employees for {reb.repoweringName}:
                    </h4>

                    {linkedEmployees.length === 0 ? (
                      <div className="text-xs text-gray-500 py-2">
                        No employees currently assigned.{' '}
                        <button
                          onClick={() => setActiveReborerForModal(reb)}
                          className="text-emerald-800 font-bold underline"
                        >
                          Click here to link employees.
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {linkedEmployees.map((emp) => (
                          <div
                            key={emp.id}
                            className="p-2.5 bg-white rounded-xl border border-emerald-200 text-xs flex items-center justify-between"
                          >
                            <div>
                              <span className="font-bold text-gray-900 block truncate">
                                {emp.employeeName}
                              </span>
                              <div className="text-gray-500 text-[11px] flex items-center gap-2 mt-0.5">
                                <span className="font-mono text-emerald-800 font-semibold">
                                  {emp.mobileNumber}
                                </span>
                                {emp.dateOfBirth && <span>DOB: {emp.dateOfBirth}</span>}
                              </div>
                            </div>
                            <a
                              href={`tel:${emp.mobileNumber}`}
                              className="p-1.5 text-emerald-800 hover:bg-emerald-50 rounded-lg shrink-0"
                            >
                              <Phone className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteConfirm.isOpen}
        title="DELETE REBORER"
        message={`Are you sure you want to delete "${deleteConfirm.repoweringName}"?`}
        subMessage="Assigned employees will not be deleted from the database; only their relationship to this reborer will be cleanly removed."
        type="danger"
        confirmText="Delete Reborer"
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirm({ isOpen: false, reborerId: '', repoweringName: '' })}
      />

      {/* Work In Employee Modal */}
      {activeReborerForModal && (
        <WorkInEmployeeModal
          isOpen={!!activeReborerForModal}
          reborerId={activeReborerForModal.id}
          repoweringName={activeReborerForModal.repoweringName}
          linkedEmployeeIds={reborerLinksMap.get(activeReborerForModal.id) || []}
          onUpdateLinkedIds={(ids) => {
            const nextMap = new Map(reborerLinksMap);
            nextMap.set(activeReborerForModal.id, ids);
            setReborerLinksMap(nextMap);
          }}
          onClose={() => {
            setActiveReborerForModal(null);
            loadData();
          }}
        />
      )}
    </div>
  );
};
