{/* Actions */}
                  {activeitemId === item.id && (
                    <div className="flex items-center gap-2 self-start shrink-0">
                      <button onClick={() => onEditIdData(item.id)} className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white">EDIT</button>
                      <button onClick={() => setDeleteConfirm({ isOpen: true, recordId: item.id, firmName: item.firmName })} className="rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white">DELETE</button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Password Decryption & Reveal Modal */}
      <PasswordRevealModal
        isOpen={!!activeRecordForPassword}
        record={activeRecordForPassword}
        onClose={() => setActiveRecordForPassword(null)}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteConfirm.isOpen}
        title="DELETE ID RECORD"
        message={`Are you sure you want to delete credentials for "${deleteConfirm.firmName}"?`}
        subMessage="This will permanently delete this ID entry and its encrypted credentials from local storage."
        type="danger"
        confirmText="Delete Record"
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirm({ isOpen: false, recordId: '', firmName: '' })}
      />
    </div>
  );
};
