# Table Components Usage Guide

## Overview

Reusable table components with sorting, pagination, row actions, bulk selection, and export functionality.

## Components

### DataTable

Main table component with all features integrated.

```tsx
import { DataTable, type Column } from '@/components/tables';
import { ExportButton } from '@/components/tables/export-button';

interface Member {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

const columns: Column<Member>[] = [
  {
    key: 'firstName',
    header: 'First Name',
    sortable: true,
  },
  {
    key: 'lastName',
    header: 'Last Name',
    sortable: true,
  },
  {
    key: 'email',
    header: 'Email',
    sortable: true,
  },
  {
    key: 'status',
    header: 'Status',
    render: (member) => (
      <span className="px-2 py-1 rounded bg-green-100 text-green-800">
        Active
      </span>
    ),
  },
];

function MembersTable() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [sortKey, setSortKey] = useState<string>();
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc' | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const { data, meta } = usePaginatedApi(
    membersApi.getAll,
    { page, limit, sort: sortKey, order: sortDirection }
  );

  const handleSort = (key: string, direction: 'asc' | 'desc' | null) => {
    setSortKey(direction ? key : undefined);
    setSortDirection(direction);
    setPage(1); // Reset to first page on sort
  };

  return (
    <DataTable
      data={data || []}
      columns={columns}
      keyExtractor={(member) => member.id}
      pagination={meta}
      onPageChange={setPage}
      onLimitChange={setLimit}
      sortKey={sortKey}
      sortDirection={sortDirection}
      onSort={handleSort}
      selectable
      onSelectionChange={setSelectedIds}
      onRowClick={(member) => router.push(`/members/${member.id}`)}
      rowActions={(member) => (
        <>
          <button onClick={() => handleEdit(member)}>Edit</button>
          <button onClick={() => handleDelete(member)}>Delete</button>
        </>
      )}
      bulkActions={
        <>
          <ExportButton
            data={data || []}
            columns={columns}
            selectedIds={selectedIds}
            keyExtractor={(m) => m.id}
            filename="members"
          />
          <Button onClick={() => handleBulkDelete(selectedIds)}>
            Delete Selected
          </Button>
        </>
      }
    />
  );
}
```

### Pagination

Standalone pagination component.

```tsx
import { Pagination, type PaginationMeta } from '@/components/tables';

const meta: PaginationMeta = {
  page: 1,
  limit: 20,
  total: 100,
  totalPages: 5,
  hasNext: true,
  hasPrev: false,
};

<Pagination
  meta={meta}
  onPageChange={(page) => setPage(page)}
  onLimitChange={(limit) => setLimit(limit)}
  showLimitSelector
  limitOptions={[10, 25, 50, 100]}
/>
```

### SortableHeader

Standalone sortable header component.

```tsx
import { SortableHeader, type SortDirection } from '@/components/tables';

<SortableHeader
  sortKey="firstName"
  currentSort={sortKey}
  currentDirection={sortDirection}
  onSort={(key, direction) => handleSort(key, direction)}
>
  First Name
</SortableHeader>
```

## Features

### Sorting

- Click column header to sort
- Click again to reverse order
- Click third time to remove sort
- Visual indicators show current sort state

### Pagination

- Page navigation with Previous/Next buttons
- Page number buttons with ellipsis for large page counts
- Per-page limit selector
- Shows current range and total count

### Row Actions

- Dropdown menu per row
- Click three-dot icon to open
- Click outside to close
- Custom actions per row

### Bulk Selection

- Checkbox in header to select all
- Checkbox per row to select individual items
- Selected count display
- Bulk actions toolbar

### Export

- Export to CSV or JSON
- Export all data or selected rows
- Custom filename
- Automatic file download

## Column Configuration

```tsx
interface Column<T> {
  key: string;                    // Data key
  header: string;                 // Column header text
  sortable?: boolean;            // Enable sorting
  render?: (item: T) => React.ReactNode;  // Custom render function
  className?: string;            // Cell className
  headerClassName?: string;      // Header className
}
```

## Examples

### Basic Table

```tsx
<DataTable
  data={members}
  columns={columns}
  keyExtractor={(m) => m.id}
/>
```

### With Pagination

```tsx
<DataTable
  data={members}
  columns={columns}
  keyExtractor={(m) => m.id}
  pagination={meta}
  onPageChange={setPage}
  onLimitChange={setLimit}
/>
```

### With Sorting

```tsx
<DataTable
  data={members}
  columns={columns}
  keyExtractor={(m) => m.id}
  sortKey={sortKey}
  sortDirection={sortDirection}
  onSort={handleSort}
/>
```

### With Row Actions

```tsx
<DataTable
  data={members}
  columns={columns}
  keyExtractor={(m) => m.id}
  rowActions={(member) => (
    <>
      <button onClick={() => edit(member)}>Edit</button>
      <button onClick={() => delete(member)}>Delete</button>
    </>
  )}
/>
```

### With Bulk Selection

```tsx
<DataTable
  data={members}
  columns={columns}
  keyExtractor={(m) => m.id}
  selectable
  onSelectionChange={setSelectedIds}
  bulkActions={
    <Button onClick={() => deleteSelected(selectedIds)}>
      Delete Selected
    </Button>
  }
/>
```

### With Export

```tsx
<DataTable
  data={members}
  columns={columns}
  keyExtractor={(m) => m.id}
  selectable
  onSelectionChange={setSelectedIds}
  bulkActions={
    <ExportButton
      data={members}
      columns={columns}
      selectedIds={selectedIds}
      keyExtractor={(m) => m.id}
      filename="members"
    />
  }
/>
```

