{/* Quick Call / Action Buttons */}
                    {activeshopId === shop.id && (
                    <div className="flex items-center gap-2 self-start shrink-0">
                      <button onClick={() => onEditShop(shop.id)} className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white">EDIT</button>
                      <button onClick={() => setDeleteConfirm({ isOpen: true, shopId: shop.id, shopName: shop.shopName })} className="rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white">DELETE</button>
                    </div>
                  )}
                  </div>

                  {/* Connected Mechanics Bar */}
                  <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                    <button
                      onClick={() =>
                        setExpandedShopId(isExpanded ? null : shop.id)
                      }
                      className="text-emerald-800 hover:text-emerald-950 font-semibold flex items-center gap-1.5"
                    >
                      <Wrench className="w-3.5 h-3.5 text-emerald-700" />
                      <span>
                        {linkedMechanics.length === 0
                          ? '0 Connected Mechanics'
                          : `${linkedMechanics.length} Connected Mechanic(s)`}
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5" />
                      )}
                    </button>

                    <button
                      onClick={() => setActiveShopForModal(shop)}
                      className="text-xs text-emerald-700 font-semibold hover:underline"
                    >
                      Manage Links
                    </button>
                  </div>
                </div>

                {/* Expanded Connected Mechanics List */}
                {isExpanded && (
                  <div className="bg-emerald-50/50 p-4 border-t border-emerald-100 space-y-2">
                    <h4 className="text-xs font-bold text-emerald-950 uppercase tracking-wider mb-2">
                      Connected Mechanics for {shop.shopName}:
                    </h4>

                    {linkedMechanics.length === 0 ? (
                      <div className="text-xs text-gray-500 py-2">
                        No mechanics connected to this shop yet.{' '}
                        <button
                          onClick={() => setActiveShopForModal(shop)}
                          className="text-emerald-800 font-bold underline"
                        >
                          Click here to connect mechanics.
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {linkedMechanics.map((mech) => (
                          <div
                            key={mech.id}
                            className="p-2.5 bg-white rounded-xl border border-emerald-200 text-xs flex items-center justify-between"
                          >
                            <div className="min-w-0">
                              <span className="font-bold text-gray-900 block truncate">
                                {mech.garageName}
                              </span>
                              <span className="text-gray-500 text-[11px] flex items-center gap-2 mt-0.5">
                                <span>{mech.ownerName}</span>
                                <span>•</span>
                                <span className="font-mono text-emerald-800 font-semibold">
                                  {mech.ownerMobileNumber}
                                </span>
                              </span>
                            </div>
                            <a
                              href={`tel:${mech.ownerMobileNumber}`}
                              className="p-1.5 text-emerald-800 hover:bg-emerald-50 rounded-lg shrink-0"
                              title="Call Mechanic"
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
        title="DELETE RETAIL SHOP"
        message={`Are you sure you want to delete "${deleteConfirm.shopName}"?`}
        subMessage="Linked mechanics will not be deleted; only the connection to this shop will be unlinked safely."
        type="danger"
        confirmText="Delete Shop"
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirm({ isOpen: false, shopId: '', shopName: '' })}
      />

      {/* Connected Mechanics Modal for Active Shop */}
      {activeShopForModal && (
        <ConnectedMechanicsModal
          isOpen={!!activeShopForModal}
          shopId={activeShopForModal.id}
          shopName={activeShopForModal.shopName}
          linkedMechanicIds={shopLinksMap.get(activeShopForModal.id) || []}
          onUpdateLinkedIds={(ids) => {
            const nextMap = new Map(shopLinksMap);
            nextMap.set(activeShopForModal.id, ids);
            setShopLinksMap(nextMap);
          }}
          onClose={() => {
            setActiveShopForModal(null);
            loadData();
          }}
        />
      )}
    </div>
  );
};
