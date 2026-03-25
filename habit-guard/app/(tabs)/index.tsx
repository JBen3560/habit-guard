import { View, Text, Button, TextInput, StyleSheet } from 'react-native';
import { useState } from 'react';

type Task = {
  name: string;
};

export default function HomeScreen() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingText, setEditingText] = useState('');

  const addTask = () => {
    if (newTask.trim() === '') return;
    setTasks([...tasks, { name: newTask }]);
    setNewTask('');
  };

  const startEdit = (index: number) => {
    setEditingIndex(index);
    setEditingText(tasks[index].name);
  };

  const saveEdit = () => {
    if (editingIndex === null) return;

    const updatedTasks = [...tasks];
    updatedTasks[editingIndex].name = editingText;

    setTasks(updatedTasks);
    setEditingIndex(null);
    setEditingText('');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tasks</Text>

      {/* Add Task */}
      <TextInput
        style={styles.input}
        placeholder="Enter new habit"
        value={newTask}
        onChangeText={setNewTask}
      />
      <Button title="Add Task" onPress={addTask} />

      {/* Task List */}
      {tasks.map((task, index) => (
        <View key={index} style={styles.taskRow}>
          {editingIndex === index ? (
            <>
              <TextInput
                style={styles.input}
                value={editingText}
                onChangeText={setEditingText}
              />
              <Button title="Save" onPress={saveEdit} />
            </>
          ) : (
            <>
              <Text style={styles.task}>{task.name}</Text>
              <Button title="Edit" onPress={() => startEdit(index)} />
            </>
          )}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 10,
  },
  task: {
    fontSize: 18,
  },
  taskRow: {
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    padding: 8,
    marginBottom: 5,
  },
});
