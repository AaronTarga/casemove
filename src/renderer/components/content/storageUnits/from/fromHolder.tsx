import StorageFilter from './fromFilters';
import StorageRow from './fromStorageRow';
import StorageSelectorContent from './fromSelector';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { sortDataFunction } from '../../shared/inventoryFunctions';
import { useState } from 'react';

function StorageUnits() {
  function classNames(...classes) {
    return classes.filter(Boolean).join(' ');
  }
  const inventory = useSelector((state: any) => state.inventoryReducer);
  const fromReducer = useSelector((state: any) => state.moveFromReducer);
  const [getStorage, setStorage] = useState(inventory.storageInventory);

  async function storageResult() {
    const storageResult = await sortDataFunction(
      fromReducer.sortValue,
      inventory.storageInventory
    );
    setStorage(storageResult);
  }
  storageResult();

  return (
    <>
      {/* Storage units */}
      <StorageSelectorContent />

      <StorageFilter />

      {/* Projects table (small breakpoint and up) */}

      <div className="hidden sm:block">
        <div className="align-middle inline-block min-w-full border-b border-gray-200">
          <table className="min-w-full">
            <thead>
              <tr className=" border-gray-200 sticky top-0">
                <th className="table-cell px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <span className="lg:pl-2">Product</span>
                </th>

                <th className="hidden md:table-cell px-6 py-3 border-b border-gray-200 bg-gray-50 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Storage
                </th>
                <th className="hidden md:table-cell px-6 py-3 border-b border-gray-200 bg-gray-50 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tradehold
                </th>
                <th className="table-cell px-6 py-3 border-b border-gray-200 bg-gray-50 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  QTY
                </th>
                <th className="hidden md:table-cell px-6 py-3 border-b border-gray-200 bg-gray-50 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  move
                </th>
                <th className="table-cell px-6 py-3 border-b border-gray-200 bg-gray-50 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <span className="md:hidden">move</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {getStorage.map((project) => (
                <tr
                  key={project.item_id}
                  className={classNames(
                    project.item_name
                      ?.toLowerCase()
                      .includes(fromReducer.searchInput.toLowerCase())
                      ? ''
                      : 'hidden',
                    'hover:shadow-inner'
                  )}
                >
                  <StorageRow projectRow={project} />
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

export default function FromMainComponent() {
  return (
    <Router>
      <Route path="/" component={StorageUnits} />
    </Router>
  );
}