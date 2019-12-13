import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

// import Ag-grid module
import { AgGridReact } from 'ag-grid-react';
import { AllModules } from '@ag-grid-enterprise/all-modules';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-balham.css';
import "@ag-grid-enterprise/all-modules/dist/styles/ag-grid.css";
import "@ag-grid-enterprise/all-modules/dist/styles/ag-theme-balham.css";

// import @material-ui components
import { Button } from '@material-ui/core';

// import Redux
import withReducer from 'app/store/withReducer';
import * as Actions from '../store/actions';
import reducer from '../store/reducers';

// import utils
import * as Utils from '../../../../utils';

// import env server link
const environment = require('../RegistrationEnv');
const SERVER_LINK = (environment.env === 'server') ? environment.ServerLink.prod : environment.ServerLink.env;

const getLazyLoadingDataSet = (endRow, startRow) => {
	return new Promise((resolve, reject) => {
		Utils.xapi().get(`${SERVER_LINK}/api/attendee-sas?page=${endRow / 50 - 1}&size=${50}`)
			.then(response => {
				console.log('here lazy loading data set function: ', response.data);
				resolve(response.data);
			})
			.catch(error => {
				reject(error);
			});
	});
};

const getBadge = (item) => {
	return new Promise((resolve, reject) => {
		Utils.xapi().get(`${SERVER_LINK}/api/badge-sas?attendeeSAId.equals=${item.id}`)
			.then((res) => {
				console.log('here in badge response: ', res);
				resolve((res.data && res.data.length > 0) ? res.data[0] : 0);
			})
			.catch((err) => {
				reject(err);
			});
	});
};

const getBadgeActivity = (item) => {
	return new Promise((resolve, reject) => {
		Utils.xapi().get(`${SERVER_LINK}/api/badge-activity-sas?badgeSAId.equals=${item.badgeId}`)
			.then((res) => {
				console.log('here in badge activity response: ', res);
				resolve((res.data && res.data.length > 0) ? res.data[0] : 0);
			})
			.catch((err) => {
				reject(err);
			});
	});
}

const getBadgeIdArr = (attendees, dispatch) => {
	const promiseArr = attendees.map((attendee, index) => {
		return getBadge(attendee);
	});

	Promise.all(promiseArr).then(values => {
		let badgeIdArr = [];
		values.map((value, index) => {
			if (value) {
				badgeIdArr.push({
					badgeFriendlyID: value.badgeFriendlyID,
					badgeActivitySAId: value.badgeActivitySAId,
					attendeeSAId: value.attendeeSAId,
					badgeId: value.id,
				});
			} else {
				badgeIdArr.push({
					badgeFriendlyID: 0,
					badgeActivitySAId: 0,
					attendeeSAId: 0,
					badgeId: 0,
				});
			}
		});
		dispatch(Actions.getBadgeIDs(badgeIdArr));
	}).catch(error => {
		console.log('here error in get badge id error: ', error);
	});
};

const getPrintCountArr = (badges, dispatch) => {
	const promiseArr = badges.map((badgeID, index) => {
		return getBadgeActivity(badgeID);
	});

	Promise.all(promiseArr).then(values => {
		let printCountArr = [];
		values.map((value, index) => {
			// return attendeeID and badgeFriendlyID
			if (value) {
				printCountArr.push({
					badgeActivityId: value.id,
					printedCount: value.printedCount,
					badgeId: badges[index].badgeId,
				});
			} else {
				printCountArr.push({
					badgeActivityId: 0,
					printedCount: 0,
					badgeId: badges[index].badgeId,
				});
			}
		});
		dispatch(Actions.getPrintCounts(printCountArr));
	}).catch(error => {
		console.log('here error in get print count error: ', error);
	});
};

function BadgeTable(props) {
	const dispatch = useDispatch();
	const attendees = useSelector(({ registerApp }) => registerApp.badge.attendees);
	const totalAttendeeCount = useSelector(({ registerApp }) => registerApp.badge.totalAttendeeCount);
	const badges = useSelector(({ registerApp }) => registerApp.badge.badges);
	const badgeActivities = useSelector(({ registerApp }) => registerApp.badge.badgeActivities);

	console.log('here in badge table: ', attendees, totalAttendeeCount, badges, badgeActivities);

	const columnDefs = [
		{
			headerName: 'Badge ID',
			field: 'badgeFriendId',
			cellStyle: {
				'padding': '15px',
				'font-size': '14px',
				'font-family': 'sans-serif',
			},
			checkboxSelection: true,
		},
		{
			headerName: 'Printed(Count)',
			field: 'printedCount',
			cellStyle: {
				'padding': '15px',
				'font-size': '14px',
				'font-family': 'sans-serif',
			}
		},
		{
			headerName: 'Action',
			cellRenderer: "actionCellRenderer",
			field: 'action',
			cellStyle: {
				'margin-top': '5px',
			},
			sortable: false,
			filter: false
		},
		{
			headerName: 'First Name',
			field: 'firstName',
			cellStyle: {
				'padding': '15px',
				'font-size': '14px',
				'font-family': 'sans-serif',
			},
		},
		{
			headerName: 'Last Name',
			field: 'lastName',
			cellStyle: {
				'padding': '15px',
				'font-size': '14px',
				'font-family': 'sans-serif',
			},
		},
		{
			headerName: 'Category',
			field: 'category',
			cellStyle: {
				'padding': '15px',
				'font-size': '14px',
				'font-family': 'sans-serif',
			}
		},
		{
			headerName: 'Company',
			field: 'companyName',
			cellStyle: {
				'padding': '15px',
				'font-size': '14px',
				'font-family': 'sans-serif',
			}
		},
	];
	const defs = {
		defaultColDef: {
			resizable: true,
			sortable: true,
			filter: true,
		},
		sideBar: "columns",
		rowData: [],
		modules: AllModules,
		overlayLoadingTemplate: '<span class="ag-overlay-loading-center">Please wait while your rows are loading</span>',
		overlayNoRowsTemplate: "<span style=\"padding: 10px; border: 2px solid #444; background: #fafafa;\">Loading ... </span>"
	};
	const frameworkComponents = {
		actionCellRenderer: ActionCellRenderer
	};
	const getRowHeight = () => {
		return 48;
	};
	const headerHeight = () => {
		return 32;
	};
	const onSelectionChanged = (params) => {
		const gridApi = params.api;
		const selectedRow = gridApi.getSelectedRows();
		console.log('here in selected row data in ag-grid: ', selectedRow);
		dispatch(Actions.setBadgeAttendeeSelectedRows(selectedRow));
	};

	const onGridReady = params => {
		const server = new FakeServer(totalAttendeeCount, dispatch);
		const dataSource = new ServerSideDataSource(server);
		params.api.setServerSideDatasource(dataSource);
	}

	return (
		<React.Fragment>
			<div
				className="table-responsive ag-theme-balham"
				style={{ height: '100%', width: '100%', fontSize: '16px' }}
			>
				<AgGridReact
					modules={defs.modules}
					columnDefs={columnDefs}
					defaultColDef={defs.defaultColDef}
					frameworkComponents={frameworkComponents}
					rowSelection={'multiple'}
					pagination={true}
					paginationPageSize={20}
					onSelectionChanged={onSelectionChanged}
					rowModelType={'serverSide'}
					cacheBlockSize={50}
					maxBlocksInCache={10}
					animateRows={true}
					onGridReady={onGridReady}
					getRowHeight={getRowHeight}
					headerHeight={headerHeight}
					overlayLoadingTemplate={defs.overlayLoadingTemplate}
					overlayNoRowsTemplate={defs.overlayNoRowsTemplate}
				>
				</AgGridReact>
			</div>
		</React.Fragment>
	);
}

// Ag-Grid Server Side Data source
function ServerSideDataSource(server) {
	return {
		getRows: async function (params) {
			var response = await server.getResponse(params.request);
			if (response.success) {
				params.successCallback(response.rows, response.lastRow);
			} else {
				params.failCallback();
			}
		}
	};
}

// Ag-Grid Fake server
function FakeServer(totalAttendeeCount, dispatch) {
	return {
		getResponse: async function (request) {
			console.log("asking for rows: " + request.startRow + " to " + request.endRow);
			const lazyLoadingSet = await getLazyLoadingDataSet(request.endRow, request.startRow, totalAttendeeCount);
			let lastRow = request.endRow <= totalAttendeeCount ? -1 : totalAttendeeCount;
			dispatch(Actions.getBadgeAttendees(lazyLoadingSet));
			const rows = lazyLoadingSet.map(attendee => {
				return {
					...attendee,
					badgeFriendId: 0,
					printedCount: 0,
					category: (attendee.attendeeCategorySAS[0] && attendee.attendeeCategorySAS[0].categoryName) || '',
				};
			});
			return {
				success: true,
				rows,
				lastRow,
			};
		}
	};
}

// Action cell renderer
function ActionCellRenderer(props) {
	console.log("badgeIds", props)
	const dispatch = useDispatch();
	const printHandler = () => {
		const { data } = props;
		// dispatch(Actions.updateBadgeActivity(data));
		console.log('here print button click event: ', data);
	}

	if (props.data.printCount >= 1) {
		return (
			<Button onClick={printHandler} disabled={true} variant="contained" color="secondary">Printed</Button>
		);
	} else {
		return (
			<Button onClick={printHandler} variant="contained" color="secondary">Printed</Button>
		);
	}
}

export default withReducer('registerApp', reducer)(BadgeTable);
