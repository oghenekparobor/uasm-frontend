# Frontend Access Matrix

**Goal**: The frontend must never guess permissions, only reflect what backend allows.

This matrix defines what UI elements are visible to each role. The frontend uses this only to hide UI, not enforce security. All security is enforced by the backend via RLS.

---

## Super Admin

### Dashboard Widgets
- ✅ Total Members
- ✅ Total Classes/Platoons
- ✅ Total Workers
- ✅ Attendance Summary (all classes)
- ✅ Distribution Overview
- ✅ Kitchen Production Stats
- ✅ Empowerment Requests (pending/approved)
- ✅ Activity Logs Summary
- ✅ System Statistics

### Pages / Navigation
- ✅ `/dashboard` - Full dashboard with all stats
- ✅ `/members` - View all members (all classes)
- ✅ `/attendance` - View all attendance records
- ✅ `/classes` - Manage all classes/platoons
- ✅ `/users` - Manage all workers
- ✅ `/distribution` - View distribution overview
- ✅ `/kitchen` - View kitchen operations
- ✅ `/empowerment` - View all empowerment requests
- ✅ `/requests` - View all requests
- ✅ `/events` - View all events
- ✅ `/activity-logs` - View all activity logs
- ✅ `/reports` - Generate reports

### Actions Enabled
- ✅ **Full Write Access**: Create, Update, Delete on all resources
- ✅ **Role Management**: Assign/remove any role
- ✅ **Approvals**: Approve/reject empowerment requests, events, general requests
- ✅ **User Management**: Create, update, delete workers
- ✅ **Class Management**: Create, update, assign leaders
- ✅ **Member Management**: Create, update, transfer members
- ✅ **Attendance**: Open/close windows, view all records
- ✅ **Distribution**: View all allocations
- ✅ **Kitchen**: View all recipes and production logs

---

## Admin

### Dashboard Widgets
- ✅ Total Members
- ✅ Total Classes/Platoons
- ✅ Total Workers
- ✅ Attendance Summary (all classes)
- ✅ Distribution Overview
- ✅ Kitchen Production Stats
- ✅ Empowerment Requests (pending/approved)
- ✅ Activity Logs Summary

### Pages / Navigation
- ✅ `/dashboard` - Dashboard with admin stats
- ✅ `/members` - View all members (all classes)
- ✅ `/attendance` - View all attendance records
- ✅ `/classes` - Manage all classes/platoons
- ✅ `/users` - Manage all workers
- ✅ `/distribution` - View distribution overview
- ✅ `/kitchen` - View kitchen operations
- ✅ `/empowerment` - View all empowerment requests
- ✅ `/requests` - View all requests
- ✅ `/events` - View all events
- ✅ `/activity-logs` - View all activity logs
- ✅ `/reports` - Generate reports

### Actions Enabled
- ✅ **Write Access**: Create, Update on most resources
- ✅ **Role Management**: Assign roles (cannot remove roles)
- ✅ **Approvals**: Approve/reject empowerment requests, events, general requests
- ✅ **User Management**: Create, update workers
- ✅ **Class Management**: Create, update, assign leaders
- ✅ **Member Management**: Create, update, transfer members
- ✅ **Attendance**: Open/close windows, view all records
- ✅ **Distribution**: View all allocations
- ✅ **Kitchen**: View all recipes and production logs
- ❌ **Cannot**: Remove roles (super admin only)

---

## Platoon Leader

### Dashboard Widgets
- ✅ My Platoons Summary
- ✅ Members in My Platoons
- ✅ Attendance Summary (my platoons)
- ✅ Empowerment Requests (my platoons)
- ✅ Recent Member Logs (my platoons)
- ✅ Upcoming Events (my platoons)

### Pages / Navigation
- ✅ `/dashboard` - Leader dashboard
- ✅ `/members` - View members in my platoons only
- ✅ `/attendance` - Submit/view attendance for my platoons
- ✅ `/empowerment` - Create/view empowerment requests for my members
- ✅ `/events` - Create/view events for my platoons
- ✅ `/member-logs` - View logs for my members
- ✅ `/requests` - Create/view my requests
- ✅ `/notifications` - View notifications

### Actions Enabled
- ✅ **Read Access**: View members, attendance, logs in assigned platoons
- ✅ **Write Access**: 
  - Create/update members in assigned platoons
  - Submit attendance for assigned platoons
  - Create empowerment requests for members
  - Create events for assigned platoons
  - Create member logs for assigned members
  - Create general requests
- ❌ **Cannot**: 
  - View other platoons' data
  - Approve empowerment requests
  - Manage users or roles
  - Open/close attendance windows
  - Manage distribution or kitchen

---

## Assistant Platoon Leader

### Dashboard Widgets
- ✅ My Platoons Summary
- ✅ Members in My Platoons
- ✅ Attendance Summary (my platoons)
- ✅ Recent Member Logs (my platoons)
- ✅ Upcoming Events (my platoons)

### Pages / Navigation
- ✅ `/dashboard` - Assistant leader dashboard
- ✅ `/members` - View members in my platoons only
- ✅ `/attendance` - Submit/view attendance for my platoons
- ✅ `/events` - View events for my platoons
- ✅ `/member-logs` - View logs for my members
- ✅ `/requests` - Create/view my requests
- ✅ `/notifications` - View notifications

### Actions Enabled
- ✅ **Read Access**: View members, attendance, logs in assigned platoons
- ✅ **Write Access**:
  - Submit attendance for assigned platoons
  - Create member logs for assigned members
  - Create general requests
- ❌ **Cannot**:
  - Create/update members
  - Create empowerment requests
  - Create events
  - View other platoons' data
  - Approve requests
  - Manage users or roles

---

## Children Teacher

### Dashboard Widgets
- ✅ My Classes Summary
- ✅ Members in My Classes
- ✅ Attendance Summary (my classes)
- ✅ Recent Member Logs (my classes)

### Pages / Navigation
- ✅ `/dashboard` - Teacher dashboard
- ✅ `/members` - View members in my classes only
- ✅ `/attendance` - Submit/view attendance for my classes
- ✅ `/member-logs` - View/create logs for my members
- ✅ `/requests` - Create/view my requests
- ✅ `/notifications` - View notifications

### Actions Enabled
- ✅ **Read Access**: View members, attendance, logs in assigned classes
- ✅ **Write Access**:
  - Submit attendance for assigned classes
  - Create member logs for assigned members
  - Create general requests
- ❌ **Cannot**:
  - Create/update members
  - Create empowerment requests
  - Create events
  - View other classes' data
  - Approve requests
  - Manage users or roles

---

## Distribution

### Dashboard Widgets
- ✅ Current Batch Status
- ✅ Allocation Summary
- ✅ Attendance Summary (for allocation planning)
- ✅ Pending Allocations

### Pages / Navigation
- ✅ `/dashboard` - Distribution dashboard
- ✅ `/distribution` - Manage batches and allocations
- ✅ `/attendance` - View attendance summary (read-only)
- ✅ `/requests` - Create/view my requests
- ✅ `/notifications` - View notifications

### Actions Enabled
- ✅ **Read Access**: 
  - View attendance summary
  - View all classes (for allocation)
  - View distribution history
- ✅ **Write Access**:
  - Create distribution batches
  - Allocate food/water to classes
  - Update allocations
  - Confirm receipt
  - Create general requests
- ❌ **Cannot**:
  - Create/update members
  - Submit attendance
  - Create empowerment requests
  - Create events
  - Manage users or roles
  - Create kitchen recipes

---

## Kitchen

### Dashboard Widgets
- ✅ Production Logs Summary
- ✅ Recipes Count
- ✅ Weekly Production Stats
- ✅ Recent Production Logs

### Pages / Navigation
- ✅ `/dashboard` - Kitchen dashboard
- ✅ `/kitchen/recipes` - Manage recipes
- ✅ `/kitchen/production` - Log production
- ✅ `/requests` - Create/view my requests
- ✅ `/notifications` - View notifications

### Actions Enabled
- ✅ **Read Access**: 
  - View all recipes
  - View production logs
- ✅ **Write Access**:
  - Create/update recipes
  - Log weekly production
  - Create general requests
- ❌ **Cannot**:
  - Create/update members
  - Submit attendance
  - Create empowerment requests
  - Create events
  - Manage users or roles
  - Manage distribution

---

## Worker (Base Role)

### Dashboard Widgets
- ✅ My Profile Summary
- ✅ My Requests Status
- ✅ My Notifications

### Pages / Navigation
- ✅ `/dashboard` - Worker dashboard
- ✅ `/requests` - Create/view my requests
- ✅ `/notifications` - View notifications
- ✅ `/profile` - View my profile

### Actions Enabled
- ✅ **Read Access**: 
  - View own profile
  - View own requests
  - View own notifications
- ✅ **Write Access**:
  - Create general requests
  - Update own profile (if allowed)
- ❌ **Cannot**:
  - View any members, classes, attendance
  - Create/update any resources
  - Approve requests
  - Manage anything

---

## Notes

1. **Backend Enforcement**: All permissions are enforced by backend RLS. Frontend only hides UI elements.

2. **Error Handling**: If a user tries to access a restricted resource:
   - Backend returns `403 Forbidden`
   - Frontend shows "Access Restricted" message
   - User is redirected to their dashboard

3. **Dynamic Visibility**: Some UI elements may be conditionally visible based on:
   - User's role
   - User's assigned platoon IDs
   - Resource ownership (e.g., own requests)

4. **Route Guards**: All routes check authentication and role before rendering.

5. **API Errors**: Frontend gracefully handles all API errors:
   - `401 Unauthorized` → Redirect to login
   - `403 Forbidden` → Show access restricted
   - `404 Not Found` → Show not found
   - `500 Server Error` → Show error message

