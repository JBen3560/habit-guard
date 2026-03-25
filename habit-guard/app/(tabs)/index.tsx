import {
  View,
  Text,
  Button,
  TextInput,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useState } from 'react';

type Task = {
  name: string;
  time: string;
  completed: boolean;
};

export default function HomeScreen() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState('');

  const addTask = () => {
    if (newTask.trim() === '') return;

    setTasks([
      ...tasks,
      { name: newTask, time: '08:00', completed: false },
    ]);

    setNewTask('');
  };

  const toggleComplete = (index: number) => {
    const updated = [...tasks];
    updated[index].completed = !updated[index].completed;
    setTasks(updated);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tasks</Text>

      {/* Input */}
      <TextInput
        style={styles.input}
        placeholder="Enter new habit"
        value={newTask}
        onChangeText={setNewTask}
      />

      <TouchableOpacity style={styles.addButton} onPress={addTask}>
        <Text style={styles.addButtonText}>+ Add Task</Text>
      </TouchableOpacity>

      {/* Task List */}
      {tasks.map((task, index) => (
        <View key={index} style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.taskName}>{task.name}</Text>
            <Text style={styles.time}>{task.time}</Text>
          </View>

          <View style={styles.row}>
            <TouchableOpacity
              style={styles.skipButton}
              onPress={() => alert('Skipped')}
            >
              <Text>Skip</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.doneButton,
                task.completed && styles.completed,
              ]}
              onPress={() => toggleComplete(index)}
            >
              <Text style={{ color: 'white' }}>
                {task.completed ? 'Done ✓' : 'Done'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f5f7fb',
    flex: 1,
  },

  title: {
    fontSize: 26,
    fontWeight: '600',
    marginBottom: 10,
  },

  input: {
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },

  addButton: {
    backgroundColor: '#3b82f6',
    padding: 12,
    borderRadius: 10,
    marginBottom: 15,
    alignItems: 'center',
  },

  addButtonText: {
    color: 'white',
    fontWeight: '600',
  },

  card: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  taskName: {
    fontSize: 18,
    fontWeight: '500',
  },

  time: {
    color: 'gray',
  },

  skipButton: {
    backgroundColor: '#e5e7eb',
    padding: 8,
    borderRadius: 8,
  },

  doneButton: {
    backgroundColor: '#3b82f6',
    padding: 8,
    borderRadius: 8,
  },

  completed: {
    backgroundColor: '#22c55e',
  },
});
