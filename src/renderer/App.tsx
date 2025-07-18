import { Dialog, Menu, Transition } from '@headlessui/react';
import {
  ArchiveIcon,
  BeakerIcon,
  DocumentDownloadIcon,
  MenuAlt1Icon,
  XIcon,
} from '@heroicons/react/outline';
import {
  ChartBarIcon,
  DownloadIcon,
  InboxInIcon,
  RefreshIcon,
  SearchIcon,
  SelectorIcon,
  UploadIcon,
} from '@heroicons/react/solid';
import { Fragment, SetStateAction, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Link,
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
  useLocation,
} from 'react-router-dom';
import 'tailwindcss/tailwind.css';
import inventoryContent from './components/content/Inventory/inventory';
import { itemCategories } from './components/content/shared/categories';
import {
  classNames,
  sortDataFunction,
} from './components/content/shared/filters/inventoryFunctions';
import Logo from './components/content/shared/iconsLogo/logo 2';
import TradeResultModal from './components/content/shared/modals & notifcations/modalTradeResult';
import itemRarities from './components/content/shared/rarities';
import TitleBarWindows from './components/content/shared/titleBarWindows';
import StorageUnitsComponent from './components/content/storageUnits/from/Content';
import ToContent from './components/content/storageUnits/to/toHolder';
import { toMoveContext } from './context/toMoveContext';
import { filterItemRows } from './functionsClasses/filters/custom';
import { ReducerManager } from './functionsClasses/reducerManager';
import {
  DispatchIPC,
  DispatchStore,
} from './functionsClasses/rendererCommands/admin';
import { Settings, State } from './interfaces/states';
import {
  inventoryAddCategoryFilter,
  inventoryAddRarityFilter,
  inventorySetFilter,
} from './store/actions/filtersInventoryActions';
import { setTradeFoundMatch } from './store/actions/modalTrade';
import { pricing_addPrice } from './store/actions/pricingActions';
import { signOut } from './store/actions/userStatsActions';
import { handleUserEvent } from './store/handleMessage';
import LoginPage from './views/login/login';
import OverviewPage from './views/overview/overview';
import settingsPage from './views/settings/settings';
import TradeupPage from './views/tradeUp/tradeUp';
DocumentDownloadIcon;

//{ name: 'Reports', href: '/reports', icon: DocumentDownloadIcon, current: false }
const navigation = [
  { name: 'Overview', href: '/stats', icon: ChartBarIcon, current: false },
  {
    name: 'Transfer | From',
    href: '/transferfrom',
    icon: DownloadIcon,
    current: false,
  },
  {
    name: 'Transfer | To',
    href: '/transferto',
    icon: UploadIcon,
    current: false,
  },
  { name: 'Inventory', href: '/inventory', icon: ArchiveIcon, current: false },
  { name: 'Trade up', href: '/tradeup', icon: BeakerIcon, current: false },
];

function AppContent() {
  SearchIcon;
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [currentSideMenuOption, setSideMenuOption] = useState(
    location.pathname
  );

  const [getToMoveContext, setToMoveContext] = useState({
    fromStorage: {},
  });
  const toMoveValue = useMemo(
    () => ({ getToMoveContext, setToMoveContext }),
    [getToMoveContext, setToMoveContext]
  );

  // Redux user details

  const ReducerClass = new ReducerManager(useSelector);
  const currentState: State = ReducerClass.getStorage();
  const userDetails = currentState.authReducer;
  const modalData = currentState.modalMoveReducer;
  const settingsData = currentState.settingsReducer;
  const tradeUpData = currentState.modalTradeReducer;
  const inventory = currentState.inventoryReducer;
  const filterDetails = currentState.inventoryFiltersReducer;

  document.documentElement.classList.add('dark');
  function updateAutomation(itemHref: SetStateAction<string>) {
    setSideMenuOption(itemHref);
    setSidebarOpen(false);
  }

  if (currentSideMenuOption != location.pathname) {
    setSideMenuOption(location.pathname);
  }

  // Log out of session
  const dispatch = useDispatch();
  const StoreClass = new DispatchStore(dispatch);
  const IPCClass = new DispatchIPC(dispatch);

  async function handleFilterData(combinedInventory: itemRow[]) {
    if (
      filterDetails.inventoryFilter.length > 0 ||
      filterDetails.sortValue != 'Default'
    ) {
      let filteredInv = await filterItemRows(
        combinedInventory,
        currentState.inventoryFiltersReducer.inventoryFilter
      );
      filteredInv = await sortDataFunction(
        currentState.inventoryFiltersReducer.sortValue,
        filteredInv,
        currentState.pricingReducer.prices,
        currentState.settingsReducer?.source?.title
      );

      dispatch(
        inventorySetFilter(
          currentState.inventoryFiltersReducer.inventoryFilter,
          currentState.inventoryFiltersReducer.sortValue,
          filteredInv
        )
      );
    }
  }

  // First time setup
  async function setFirstTimeSettings() {
    if (settingsData.currencyPrice[settingsData.currency] == undefined) {
      IPCClass.run(IPCClass.buildingObject.currency);
    }
    if (settingsData.os == '') {
      StoreClass.run(StoreClass.buildingObject.os);
      StoreClass.run(StoreClass.buildingObject.columns);
      StoreClass.run(StoreClass.buildingObject.devmode);
      StoreClass.run(StoreClass.buildingObject.fastmove);
      StoreClass.run(StoreClass.buildingObject.source);
      StoreClass.run(StoreClass.buildingObject.locale);
      StoreClass.run(StoreClass.buildingObject.steamLoginShow);
    }
  }

  // Forward user event to Store
  if (isListening == false) {
    setFirstTimeSettings();
    window.electron.ipcRenderer.userEvents().then((messageValue) => {
      handleSubMessage(messageValue, settingsData);
    });

    setIsListening(true);
  }

  async function handleSubMessage(messageValue, settingsData) {
    if (settingsData.fastMove && modalData.query.length > 0) {
      console.log('Command blocked', modalData.moveOpen, settingsData.fastMove);
      setIsListening(false);
      return;
    }
    if (messageValue.command == undefined) {
      const actionToTake = (await handleUserEvent(
        messageValue,
        settingsData
      )) as any;
      dispatch(actionToTake);
      if (messageValue[0] == 1) {
        await handleFilterData(actionToTake.payload.combinedInventory);
      }
    }

    setIsListening(false);
  }

  async function logOut() {
    window.electron.ipcRenderer.logUserOut();
    dispatch(signOut());
  }

  async function retryConnection() {
    window.electron.ipcRenderer.retryConnection();
  }

  // Should update status
  const [shouldUpdate, setShouldUpdate] = useState(false);
  const [shouldCheckUpdate, setShouldCheckUpdate] = useState(true);

  const [getVersion, setVersion] = useState('');
  async function getUpdate() {
    const doUpdate = await window.electron.ipcRenderer.needUpdate();
    console.log(doUpdate);
    setVersion('v' + doUpdate.currentVersion);
    setShouldUpdate(doUpdate.requireUpdate);
  }
  if (shouldCheckUpdate == true) {
    setShouldCheckUpdate(false);
    getUpdate();
  }

  // Pricing
  const [firstRun, setFirstRun] = useState(false);

  if (firstRun == false) {
    setFirstRun(true);
    window.electron.ipcRenderer.on('pricing', (message: any[]) => {
      console.log(message);
      dispatch(pricing_addPrice(message[0]));
    });

    window.electron.ipcRenderer.on('updater', (message: any) => {
      console.log(message);
    });
  }

  // Trade up
  async function handleTradeUp() {
    inventory.inventory.forEach((element) => {
      if (!tradeUpData.inventoryFirst.includes(element.item_id)) {
        dispatch(setTradeFoundMatch(element));
      }
    });
  }
  if (tradeUpData.inventoryFirst.length != 0) {
    handleTradeUp();
  }

  return (
    <>
      <TradeResultModal />
      {settingsData.os != 'win32' ? '' : <TitleBarWindows />}
      <div
        className={classNames(
          settingsData.os == 'win32' ? 'pt-7' : '',
          'min-h-full dark:bg-dark-level-one h-screen'
        )}
      >
        <Transition.Root show={sidebarOpen} as={Fragment}>
          <Dialog
            as="div"
            className="fixed inset-0 flex z-40 dark:bg-dark-level-two lg:hidden"
            onClose={setSidebarOpen}
          >
            <Transition.Child
              as={Fragment}
              enter="transition-opacity ease-linear duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="transition-opacity ease-linear duration-300"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Dialog.Overlay className="fixed inset-0 bg-gray-600 bg-opacity-75" />
            </Transition.Child>
            <Transition.Child
              as={Fragment}
              enter="transition ease-in-out duration-300 transform"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in-out duration-300 transform"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <div className="relative flex-1 flex flex-col max-w-xs w-full pt-5 pb-4 bg-white">
                <Transition.Child
                  as={Fragment}
                  enter="ease-in-out duration-300"
                  enterFrom="opacity-0"
                  enterTo="opacity-100"
                  leave="ease-in-out duration-300"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <div className="absolute top-0 right-0 -mr-12 pt-2">
                    <button
                      type="button"
                      className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                      onClick={() => setSidebarOpen(false)}
                    >
                      <span className="sr-only">Close sidebar</span>
                      <XIcon
                        className="h-6 w-6 text-white"
                        aria-hidden="true"
                      />
                    </button>
                  </div>
                </Transition.Child>
                <div
                  className={classNames(
                    settingsData.os == 'win32' ? 'pt-7' : '',
                    'flex-shrink-0 flex items-center px-4'
                  )}
                >
                  <Logo />
                  <span className="">{shouldUpdate}</span>
                </div>
                <div className="mt-5 flex-1 h-0 overflow-y-auto">
                  <nav className="px-2">
                    <div className="space-y-1">
                      {navigation.map((item) => (
                        <Link
                          key={item.name}
                          to={item.href}
                          className={classNames(
                            currentSideMenuOption.includes(item.href)
                              ? 'bg-gray-100 text-gray-900'
                              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50',
                            userDetails.isLoggedIn ? '' : 'pointer-events-none',
                            'group flex items-center px-2 py-2 text-base leading-5 font-medium rounded-md'
                          )}
                          aria-current={item.current ? 'page' : undefined}
                          onClick={() => updateAutomation(item.href)}
                        >
                          <item.icon
                            className={classNames(
                              item.current
                                ? 'text-gray-500'
                                : 'text-gray-400 group-hover:text-gray-500',
                              'mr-3 flex-shrink-0 h-6 w-6'
                            )}
                            aria-hidden="true"
                          />
                          {item.name}
                        </Link>
                      ))}
                    </div>
                    <div className="mt-8">
                      <h3
                        className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider"
                        id="mobile-teams-headline"
                      >
                        Teams
                      </h3>
                      <div
                        className="mt-1 space-y-1"
                        role="group"
                        aria-labelledby="mobile-teams-headline"
                      >
                        {itemCategories.map((team) => (
                          <a
                            key={team.name}
                            href={team.href}
                            className="group flex items-center px-3 py-2 text-base leading-5 font-medium text-gray-600 rounded-md hover:text-gray-900 hover:bg-gray-50"
                          >
                            <span
                              className={classNames(
                                team.bgColorClass,
                                'w-2.5 h-2.5 mr-4 rounded-full'
                              )}
                              aria-hidden="true"
                            />
                            <span className="truncate">{team.name}</span>
                          </a>
                        ))}
                      </div>
                    </div>
                  </nav>
                </div>
              </div>
            </Transition.Child>
            <div className="flex-shrink-0 w-14" aria-hidden="true">
              {/* Dummy element to force sidebar to shrink to fit close icon */}
            </div>
          </Dialog>
        </Transition.Root>

        {/* Static sidebar for desktop */}
        <div className="hidden lg:flex lg:flex-col dark:bg-dark-level-two dark:border-opacity-50 lg:w-64 lg:fixed lg:inset-y-0 lg:border-r lg:border-gray-200 lg:pt-5 lg:pb-4 lg:bg-gray-100">
          <div
            className={classNames(
              settingsData.os == 'win32' ? 'pt-7' : '',
              'flex items-center flex-shrink-0 px-6'
            )}
          >
            <Logo />
          </div>
          {/* Sidebar component, swap this element with another sidebar if you like */}
          <div className="mt-6 h-0 flex-1 flex flex-col overflow-y-auto">
            {/* User account dropdown */}
            <Menu
              as="div"
              className={classNames(
                userDetails.isLoggedIn ? '' : 'pointer-events-none',
                'px-3 relative inline-block text-left'
              )}
            >
              <div>
                <Menu.Button className="group w-full bg-gray-100 rounded-md px-3.5 py-2 text-sm text-left font-medium text-gray-700 dark:bg-dark-level-two hover:bg-gray-200 focus:outline-none focus:ring-offset-2 focus:ring-offset-gray-100">
                  <span className="flex w-full justify-between items-center">
                    <span className="flex min-w-0 items-center justify-between space-x-3">
                      {userDetails.userProfilePicture == null ? (
                        <svg
                          className="w-10 h-10 rounded-full flex-shrink-0 text-gray-300"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                      ) : (
                        <img
                          className="w-10 h-10 bg-gray-300 rounded-full flex-shrink-0"
                          src={userDetails.userProfilePicture}
                          alt=""
                        />
                      )}

                      <span className="flex-1 flex flex-col min-w-0">
                        <span className="text-gray-900 dark:text-dark-white text-sm font-medium truncate">
                          {userDetails.displayName}
                        </span>
                        <span className="text-xs font-medium text-gray-500 group-hover:text-gray-500">
                          <span
                            className={classNames(
                              userDetails.CSGOConnection
                                ? 'text-green-400'
                                : 'text-red-400',
                              'text-xs font-medium'
                            )}
                          >
                            <div className="flex justify-between">
                              <div>
                                {userDetails.CSGOConnection
                                  ? 'Connected'
                                  : 'Not connected'}
                              </div>
                            </div>
                            <div className="text-gray-500">
                              {userDetails.walletBalance?.balance == 0 ||
                              userDetails.walletBalance == null
                                ? ''
                                : new Intl.NumberFormat(settingsData.locale, {
                                    style: 'currency',
                                    currency:
                                      userDetails.walletBalance?.currency ||
                                      settingsData.currency,
                                  }).format(
                                    userDetails.walletBalance?.balance || 0
                                  )}
                            </div>
                          </span>
                        </span>
                      </span>
                    </span>
                    <SelectorIcon
                      className="flex-shrink-0 h-5 w-5 text-gray-400 group-hover:text-gray-500"
                      aria-hidden="true"
                    />
                  </span>
                </Menu.Button>
              </div>
              <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items className="z-10 mx-3 origin-top absolute right-0 left-0 mt-1 rounded-md shadow-lg bg-white dark:bg-dark-level-four ring-1 ring-black ring-opacity-5 divide-y divide-gray-200 dark:divide-opacity-50 focus:outline-none">
                  <div className="py-1">
                    <Menu.Item>
                      {({ active }) => (
                        <Link
                          to="/settings"
                          className={classNames(
                            active
                              ? 'bg-gray-100 text-gray-900 dark:bg-dark-level-three dark:text-dark-white'
                              : 'text-gray-700 dark:text-dark-white',
                            'block px-4 py-2 text-sm'
                          )}
                        >
                          Settings
                        </Link>
                      )}
                    </Menu.Item>
                  </div>
                  <div className="py-1">
                    <Menu.Item>
                      {({ active }) => (
                        <Link
                          to=""
                          onClick={() => logOut()}
                          className={classNames(
                            active
                              ? 'bg-gray-100 text-gray-900 dark:bg-dark-level-three dark:text-dark-white'
                              : 'text-gray-700 dark:text-dark-white',
                            'block px-4 py-2 text-sm'
                          )}
                        >
                          Logout
                        </Link>
                      )}
                    </Menu.Item>
                  </div>
                </Menu.Items>
              </Transition>
            </Menu>

            <div className={shouldUpdate ? 'px-3 mt-5' : 'px-3 mt-5 '}>
              {userDetails.CSGOConnection == false &&
              userDetails.isLoggedIn == true ? (
                <button
                  type="button"
                  onClick={() => retryConnection()}
                  className="inline-flex items-center bg-green-200 px-6 shadow-md py-3 text-left text-base w-full font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 hover:shadow-none focus:outline-none pl-9 sm:text-sm border-gray-300 rounded-md h-9 text-gray-400"
                >
                  <RefreshIcon
                    className="mr-3 h-4 w-4 text-green-900"
                    style={{ marginLeft: -25 }}
                    aria-hidden="true"
                  />
                  <span className="mr-3 text-green-900">Retry connection</span>
                </button>
              ) : shouldUpdate ? (
                <button
                  type="button"
                  disabled={true}
                  className="inline-flex items-center my-4 bg-green-200 px-6 shadow-md py-3 text-left text-base w-full font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 hover:shadow-none focus:outline-none pl-9 sm:text-sm border-gray-300 rounded-md h-9 text-gray-400"
                >
                  <InboxInIcon
                    className="mr-3 h-4 w-4 text-gray-500"
                    style={{ marginLeft: -22 }}
                    aria-hidden="true"
                  />
                  <span className="mr-3 ">
                    Update ready. <br />
                    Restart or download.
                  </span>
                </button>
              ) : (
                <div className='flex flex-col gap-3'>
                  <a href="https://discord.gg/n8QExYF7Qs" target="_blank">
                    <button
                      type="button"
                      className="flex  dark:text-dark-white items-center px-6 py-3 border border-gray-200 dark:bg-dark-level-three   dark:border-opacity-0  text-left text-base w-full font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none pl-9 sm:text-sm border-gray-300 rounded-md h-9 text-gray-400"
                    >
                      <div
                        className="mr-3  h-4 w-4 text-gray-500"
                        aria-hidden="true"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 127.14 96.36"
                          className="pt-0.5"
                        >
                          <g data-name="\u56FE\u5C42 2">
                            <g data-name="Discord Logos">
                              <path
                                d="M107.7 8.07A105.15 105.15 0 0 0 81.47 0a72.06 72.06 0 0 0-3.36 6.83 97.68 97.68 0 0 0-29.11 0A72.37 72.37 0 0 0 45.64 0a105.89 105.89 0 0 0-26.25 8.09C2.79 32.65-1.71 56.6.54 80.21a105.73 105.73 0 0 0 32.17 16.15 77.7 77.7 0 0 0 6.89-11.11 68.42 68.42 0 0 1-10.85-5.18c.91-.66 1.8-1.34 2.66-2a75.57 75.57 0 0 0 64.32 0c.87.71 1.76 1.39 2.66 2a68.68 68.68 0 0 1-10.87 5.19 77 77 0 0 0 6.89 11.1 105.25 105.25 0 0 0 32.19-16.14c2.64-27.38-4.51-51.11-18.9-72.15ZM42.45 65.69C36.18 65.69 31 60 31 53s5-12.74 11.43-12.74S54 46 53.89 53s-5.05 12.69-11.44 12.69Zm42.24 0C78.41 65.69 73.25 60 73.25 53s5-12.74 11.44-12.74S96.23 46 96.12 53s-5.04 12.69-11.43 12.69Z"
                                data-name="Discord Logo - Large - White"
                                style={{
                                  fill: '#fff',
                                }}
                              />
                            </g>
                          </g>
                        </svg>
                      </div>
                      <span className="mr-3">Join the discord</span>
                    </button>
                  </a>
                  {/* <a href="https://skinledger.com" target="_blank">
                    <button
                      type="button"
                      className="text-white bg-gradient-to-r w-full from-green-500 via-green-700 to-green-800 shadow-sm hover:opacity-80 hover:bg-gradient-to-br focus:ring-4 focus:ring-green-300 dark:focus:ring-green-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2 mb-2"
                    >
                      <span className="mr-3">Join the Skinledger beta</span>
                    </button>
                  </a> */}
                </div>
              )}
            </div>

            {/* Navigation */}
            <nav className="px-3 mt-5">
              <div className="space-y-1">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={classNames(
                      currentSideMenuOption.includes(item.href)
                        ? 'bg-gray-100 text-gray-900 dark:bg-opacity-10 dark:text-opacity-60'
                        : 'text-gray-600 dark:text-gray-200 hover:text-gray-900 hover:bg-gray-50 dark:bg-opacity-10 dark:hover:text-opacity-60 ',
                      userDetails.isLoggedIn ? '' : 'pointer-events-none',
                      'group flex items-center px-2 py-2 dark:text-dark-white text-base leading-5 font-medium rounded-md'
                    )}
                    aria-current={item.current ? 'page' : undefined}
                    onClick={() => updateAutomation(item.href)}
                  >
                    <item.icon
                      className={classNames(
                        currentSideMenuOption.includes(item.href)
                          ? 'text-gray-500 dark:text-opacity-60'
                          : 'text-gray-400 group-hover:text-gray-500',
                        'mr-3 flex-shrink-0 h-6 w-6  dark:text-dark-white'
                      )}
                      aria-hidden="true"
                    />
                    {item.name}
                  </Link>
                ))}
              </div>
              {!currentSideMenuOption.includes('/tradeup') ? (
                <div className="mt-8">
                  {/* Secondary navigation */}
                  <h3
                    className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider"
                    id="desktop-teams-headline"
                  >
                    Storage categories
                  </h3>
                  <div
                    className="mt-1 space-y-1"
                    role="group"
                    aria-labelledby="desktop-teams-headline"
                  >
                    {itemCategories.map((team) => (
                      <div
                        className={classNames(
                          filterDetails.categoryFilter?.includes(
                            team.bgColorClass
                          )
                            ? 'bg-gray-200 dark:bg-dark-level-three'
                            : '',
                          'w-full'
                        )}
                      >
                        <button
                          key={team.name}
                          onClick={() =>
                            dispatch(
                              inventoryAddCategoryFilter(team.bgColorClass)
                            )
                          }
                          className={classNames(
                            userDetails.isLoggedIn == false
                              ? 'pointer-events-none'
                              : '',
                            'group flex items-center px-3 py-2 dark:text-dark-white text-sm font-medium text-gray-700 rounded-md'
                          )}
                        >
                          <span
                            className={classNames(
                              team.bgColorClass,
                              'w-2.5 h-2.5 mr-4 rounded-full'
                            )}
                            aria-hidden="true"
                          />
                          <span className="truncate">{team.name}</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="mt-8">
                  {/* Secondary navigation */}
                  <h3
                    className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider"
                    id="desktop-teams-headline"
                  >
                    RARITY
                  </h3>
                  <div
                    className="mt-1 space-y-1"
                    role="group"
                    aria-labelledby="desktop-teams-headline"
                  >
                    {itemRarities.map((rarity) => (
                      <div
                        className={classNames(
                          filterDetails.rarityFilter?.includes(
                            rarity.bgColorClass
                          )
                            ? 'bg-gray-200 dark:bg-dark-level-three'
                            : '',
                          'w-full'
                        )}
                      >
                        <button
                          key={rarity.value}
                          onClick={() =>
                            dispatch(
                              inventoryAddRarityFilter(rarity.bgColorClass)
                            )
                          }
                          className={classNames(
                            userDetails.isLoggedIn == false
                              ? 'pointer-events-none'
                              : '',
                            'group flex items-center px-3 py-2 dark:text-dark-white text-sm font-medium text-gray-700 rounded-md'
                          )}
                        >
                          <span
                            className={classNames(
                              rarity.bgColorClass,
                              'w-2.5 h-2.5 mr-4 rounded-full'
                            )}
                            aria-hidden="true"
                          />
                          <span className="truncate">{rarity.value}</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs pl-4 text-gray-500">{getVersion}</span>
            <a
              className="flex items-center text-xs gap-2 text-dark-white hover:scale-110 transform duration-200"
              href="https://discord.gg/n8QExYF7Qs"
              target="_blank"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 127.14 96.36"
                className=" h-4 w-4  pt-0.5"
              >
                <g data-name="\u56FE\u5C42 2">
                  <g data-name="Discord Logos">
                    <path
                      d="M107.7 8.07A105.15 105.15 0 0 0 81.47 0a72.06 72.06 0 0 0-3.36 6.83 97.68 97.68 0 0 0-29.11 0A72.37 72.37 0 0 0 45.64 0a105.89 105.89 0 0 0-26.25 8.09C2.79 32.65-1.71 56.6.54 80.21a105.73 105.73 0 0 0 32.17 16.15 77.7 77.7 0 0 0 6.89-11.11 68.42 68.42 0 0 1-10.85-5.18c.91-.66 1.8-1.34 2.66-2a75.57 75.57 0 0 0 64.32 0c.87.71 1.76 1.39 2.66 2a68.68 68.68 0 0 1-10.87 5.19 77 77 0 0 0 6.89 11.1 105.25 105.25 0 0 0 32.19-16.14c2.64-27.38-4.51-51.11-18.9-72.15ZM42.45 65.69C36.18 65.69 31 60 31 53s5-12.74 11.43-12.74S54 46 53.89 53s-5.05 12.69-11.44 12.69Zm42.24 0C78.41 65.69 73.25 60 73.25 53s5-12.74 11.44-12.74S96.23 46 96.12 53s-5.04 12.69-11.43 12.69Z"
                      data-name="Discord Logo - Large - White"
                      style={{
                        fill: '#d6d3cd',
                      }}
                    />
                  </g>
                </g>
              </svg>
              Support
            </a>
          </div>
        </div>
        {/* Main column */}
        <div className="lg:pl-64 flex flex-col">
          {/* Search header */}
          <div className="sticky top-0 z-10 flex-shrink-0 flex h-16 bg-white border-b border-gray-200 lg:hidden dark:bg-dark-level-two">
            <button
              type="button"
              className="px-4 border-r border-gray-200 text-gray-500 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-inset lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <span className="sr-only">Open sidebar</span>
              <MenuAlt1Icon className="h-6 w-6" aria-hidden="true" />
            </button>
            <div className="flex-1 flex justify-between px-4 sm:px-6 lg:px-8">
              <div className="flex-1 items-center justify-end flex">
                <div className="px-3">
                  {userDetails.CSGOConnection == false &&
                  userDetails.isLoggedIn == true ? (
                    <button
                      type="button"
                      onClick={() => retryConnection()}
                      className="inline-flex items-center bg-green-200 px-6 shadow-md py-3 text-left text-base w-full font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none pl-9 sm:text-sm border-gray-300 rounded-md h-9 text-gray-400"
                    >
                      <RefreshIcon
                        className="mr-3 h-4 w-4 text-green-900 "
                        style={{ marginLeft: -25 }}
                        aria-hidden="true"
                      />
                      <span className="mr-3 text-green-900">
                        Retry connection
                      </span>
                    </button>
                  ) : shouldUpdate == false ? (
                    <a
                      href="https://steamcommunity.com/tradeoffer/new/?partner=1033744096&token=29ggoJY7"
                      target="_blank"
                    >
                      <button
                        type="button"
                        className="inline-flex items-center px-6 py-3 border border-gray-200 text-left text-base w-full font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none pl-9 sm:text-sm border-gray-300 rounded-md h-9 text-gray-400"
                      >
                        <InboxInIcon
                          className="mr-3 h-4 w-4 text-gray-500"
                          style={{ marginLeft: -22 }}
                          aria-hidden="true"
                        />
                        <span className="mr-3">Update ready</span>
                      </button>
                    </a>
                  ) : (
                    ''
                  )}
                </div>
              </div>
              <div className="flex items-center">
                {/* Profile dropdown */}
                <Menu
                  as="div"
                  className={classNames(
                    userDetails.isLoggedIn ? '' : 'pointer-events-none',
                    'ml-3 relative'
                  )}
                >
                  <div>
                    <Menu.Button className="max-w-xs bg-white flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2">
                      <span className="sr-only">Open user menu</span>
                      {userDetails.userProfilePicture == null ? (
                        <svg
                          className="w-10 h-10 rounded-full flex-shrink-0 text-gray-300"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                      ) : (
                        <img
                          className={classNames(
                            userDetails.CSGOConnection
                              ? 'border-2 border-solid border-green-400'
                              : 'border-4 border-solid border-red-400',
                            'w-10 h-10 bg-gray-300 rounded-full flex-shrink-0'
                          )}
                          src={userDetails.userProfilePicture}
                          alt=""
                        />
                      )}
                    </Menu.Button>
                  </div>
                  <Transition
                    as={Fragment}
                    enter="transition ease-out duration-100"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                  >
                    <Menu.Items className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 divide-y divide-gray-200 focus:outline-none">
                      <div className="py-1">
                        <Menu.Item>
                          {({ active }) => (
                            <Link
                              to=""
                              onClick={() => logOut()}
                              className={classNames(
                                active
                                  ? 'bg-gray-100 text-gray-900'
                                  : 'text-gray-700',
                                'block px-4 py-2 text-sm'
                              )}
                            >
                              Logout
                            </Link>
                          )}
                        </Menu.Item>
                      </div>
                    </Menu.Items>
                  </Transition>
                </Menu>
              </div>
            </div>
          </div>
          <main className="flex-1 dark:bg-dark-level-one">
          <toMoveContext.Provider value={toMoveValue}>
            <Router>
              <Routes>
                  {userDetails.isLoggedIn ? (
                    <Route path="/"  element={<Navigate to="/stats" replace />} />
                  ) : (
                    <Route path="*" element={<Navigate to="/signin" replace />} />
                  )}
                  {userDetails.isLoggedIn ? (
                    <Route path="/signin" element={<Navigate to="/stats" replace />} />
                  ) : (
                    ''
                  )}
                  <Route
                    path="/transferfrom"
                    Component={StorageUnitsComponent}
                  />
                  <Route path="/transferto" Component={ToContent} />
                  <Route path="/signin" Component={LoginPage} />
                  <Route path="/inventory" Component={inventoryContent} />
                  <Route path="/tradeup" Component={TradeupPage} />
                  <Route path="/settings" Component={settingsPage} />
                  <Route path="/stats" Component={OverviewPage} />
              </Routes>
            </Router>
            </toMoveContext.Provider>
          </main>
        </div>
      </div>
    </>
  );
}

export default function App() {

  return (
    <Router>
      <Routes>
      <Route path="*" Component={AppContent} />
      </Routes>
    </Router>
  );
}
