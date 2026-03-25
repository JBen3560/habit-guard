import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useState } from 'react';

type Task = {
  name: string;
  time: string;
  category: string;
  completed: boolean;
};

export default function HomeScreen() {
  const [tasks, setTasks] = useState<Task[]>([
    {
      name: 'Morning Medication',
      time: '08:00',
      category: 'Medication',
      completed: true,
    },
    {
      name: 'Evening Medication',
      time: '21:00',
      category: 'Medication',
      completed: true,
    },
    {
      name: 'Morning Walk',
      time: '07:30',
      category: 'Exercise',
      completed: false,
    },
    {
      name: 'Drink Water (Morning)',
      time: '07:00',
      category: 'Hydration',
      completed: false,
    },
  ]);

  const [newTask, setNewTask] = useState('');

  const addTask = () => {
    if (!newTask.trim()) return;

    setTasks([
      ...tasks,
      {
        name: newTask,
        time: '09:00',
        category: 'General',
        completed: false,
      },
    ]);

    setNewTask('');
  };

  const toggleComplete = (index: number) => {
    const updated = [...tasks];
    updated[index].completed = !updated[index].completed;
    setTasks(updated);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Today</Text>

      {/* Input */}
      <View style={styles.inputRow}>
        <TextInput
          placeholder="Add a habit..."
          value={newTask}
          onChangeText={setNewTask}
          style={styles.input}
        />
        <TouchableOpacity style={styles.addBtn} onPress={addTask}>
          <Text style={{ color: 'white', fontSize: 18 }}>+</Text>
        </TouchableOpacity>
      </View>

      {/* Tasks */}
      {tasks.map((task, index) => (
        <View key={index} style={styles.card}>
          {/* Top row */}
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

          {/* Buttons */}
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.skipBtn}
              onPress={() => alert('Skipped')}
            >
              <Text style={styles.skipText}>Skip</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.doneBtn,
                task.completed && styles.doneGreen,
              ]}
              onPress={() => toggleComplete(index)}
            >
              <Text style={styles.doneText}>
                {task.completed ? '✓ Done' : 'Done'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </ScrollView>
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

  inputRow: {
    flexDirection: 'row',
    marginBottom: 20,
  },

  input: {
    flex: 1,
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 12,
  },

  addBtn: {
    backgroundColor: '#3b82f6',
    marginLeft: 10,
    padding: 12,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    width: 50,
  },

  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
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

  skipText: {
    color: '#374151',
  },

  doneBtn: {
    backgroundColor: '#3b82f6',
    padding: 8,
    borderRadius: 10,
  },

  doneGreen: {
    backgroundColor: '#22c55e',
  },

  doneText: {
    color: 'white',
    fontWeight: '600',
  },
});
