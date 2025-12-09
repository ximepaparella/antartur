export interface ArrayFieldManagerProps<T> {
  items: T[];
  title: string;
  onAdd: () => void;
  onUpdate: (index: number, item: T) => void;
  onDelete: (index: number) => void;
  onReorder?: (fromIndex: number, toIndex: number) => void;
  renderItem: (item: T, index: number, isEditing: boolean, onUpdate: (item: T) => void) => React.ReactNode;
  getDefaultItem: () => T;
  disabled?: boolean;
}

