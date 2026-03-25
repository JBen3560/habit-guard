import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

type Task = {
  name: string;
  time: string;
  category: string;
  completed: boolean;
};

export default function HomeScreen() {
  const [tasks, setTasks] = useState<Task[]>([
    { name: 'Morning Medication', time: '08:00', category: 'Medication', completed: true },
    { name: 'Evening Medication', time: '21:00', category: 'Medication', completed: true },
    { name: 'Morning Walk', time: '07:30', category: 'Exercise', completed: false },
    { name: 'Drink Water', time: '07:00', category: 'Hydration', completed: false },
  ]);

  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [editTime, setEditTime] = useState('');
  const [editCategory, setEditCategory] = useState('');

  const startEdit = (index: number) => {
    setEditingIndex(index);
    setEditName(tasks[index].name);
    setEditTime(tasks[index].time);
    setEditCategory(tasks[index].category);
  };

  const saveEdit = () => {
    if (editingIndex === null) return;

    const updated = [...tasks];
    updated[editingIndex] = {
      ...updated[editingIndex],
      name: editName,
      time: editTime,
      category: editCategory,
    };

    setTasks(updated);
    setEditingIndex(null);
  };

  const toggleComplete = (index: number) => {
    const updated = [...tasks];
    updated[index].completed = !updated[index].completed;
    setTasks(updated);
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView style={styles.container}>
        <Text style={styles.header}>Today</Text>

        {tasks.map((task, index) => (
          <TouchableOpacity key={index} onPress={() => startEdit(index)}>
            <View style={styles.card}>
              <View style={styles.row}>
                <View>
                  <Text style={styles.taskName}>{task.name}</Text>
                  <Text style={styles.subText}>
                    {task.category} • {task.time}
                  </Text>
                </View>

                {task.completed && (
                  <View style={styles.completedBadge}>
                    <Text style={styles.completedText}>Completed</Text>
                  </View>
                )}
              </View>

              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={styles.skipBtn}
                  onPress={() => alert('Skipped')}
                >
                  <Text>Skip</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.doneBtn,
                    task.completed && styles.doneGreen,
                  ]}
                  onPress={() => toggleComplete(index)}
                >
                  <Text style={{ color: 'white' }}>
                    {task.completed ? '✓ Done' : 'Done'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        ))}

        {/* EDIT PANEL */}
        {editingIndex !== null && (
          <View style={styles.editBox}>
            <Text style={styles.editTitle}>Edit Task</Text>

            <TextInput
              value={editName}
              onChangeText={setEditName}
              style={styles.input}
              placeholder="Task name"
            />

            <TextInput
              value={editTime}
              onChangeText={setEditTime}
              style={styles.input}
              placeholder="Time (e.g. 08:00)"
            />

            <TextInput
              value={editCategory}
              onChangeText={setEditCategory}
              style={styles.input}
              placeholder="Category"
            />

            <TouchableOpacity style={styles.saveBtn} onPress={saveEdit}>
              <Text style={{ color: 'white' }}>Save Changes</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f4f6fa',
    padding: 20,
  },

  header: {
    fontSize: 28,
    fontWeight: '600',
    marginBottom: 15,
  },

  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 15,
    marginBottom: 15,
    elevation: 3,
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  taskName: {
    fontSize: 18,
    fontWeight: '600',
  },

  subText: {
    color: 'gray',
    marginTop: 4,
  },

  completedBadge: {
    backgroundColor: '#d1fae5',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },

  completedText: {
    color: '#059669',
    fontWeight: '600',
  },

  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
    gap: 10,
  },

  skipBtn: {
    backgroundColor: '#e5e7eb',
    padding: 8,
    borderRadius: 10,
  },

  doneBtn: {
    backgroundColor: '#3b82f6',
    padding: 8,
    borderRadius: 10,
  },

  doneGreen: {
    backgroundColor: '#22c55e',
  },

  editBox: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 15,
    marginTop: 20,
  },

  editTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 10,
  },

  input: {
    borderWidth: 1,
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },

  saveBtn: {
    backgroundColor: '#3b82f6',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
});
