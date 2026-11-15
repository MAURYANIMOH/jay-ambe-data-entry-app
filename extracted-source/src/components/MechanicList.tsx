{/* Actions */}
                  {activemechId === mech.id && (
                    <div className="flex items-center gap-2 self-start shrink-0">
                      <button onClick={() => onEditMechanic(mech.id)} className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white">EDIT</button>
                      <button onClick={() => setDeleteConfirm({ isOpen: true, mechId: mech.id, garageName: mech.garageName })} className="rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white">DELETE</button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteConfirm.isOpen}
        title="DELETE MECHANIC"
        message={`Are you sure you want to delete "${deleteConfirm.garageName}"?`}
        subMessage="Connected retail shop associations will be cleanly unlinked without deleting the retail shops."
        type="danger"
        confirmText="Delete Mechanic"
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirm({ isOpen: false, mechId: '', garageName: '' })}
      />
    </div>
  );
};
