import React, { useState, useRef, useEffect } from 'react';
import {
    Button,
    Container,
    Text,
    Title,
    Modal,
    TextInput,
    Group,
    Card,
    ActionIcon,
    Notification,
} from '@mantine/core';
import { MoonStars, Sun, Trash } from 'tabler-icons-react';
import { MantineProvider, ColorSchemeProvider } from '@mantine/core';
import { useColorScheme } from '@mantine/hooks';
import { useLocalStorage } from '@mantine/hooks';

export default function App() {
    const [tasks, setTasks] = useState([]);
    const [opened, setOpened] = useState(false);
    const [notification, setNotification] = useState(null);

    const preferredColorScheme = useColorScheme();
    const [colorScheme, setColorScheme] = useLocalStorage({
        key: 'mantine-color-scheme',
        defaultValue: 'dark',
        getInitialValueInEffect: true,
    });
    const toggleColorScheme = () => setColorScheme('light');


    const taskTitle = useRef('');
    const taskSummary = useRef('');

    function createTask() {
        const title = taskTitle.current.value;
        const summary = taskSummary.current.value;
        const dueDate = new Date();
        dueDate.setMinutes(dueDate.getMinutes() + 10); // Set the reminder time 10 minutes before the due date

        const newTask = {
            title,
            summary,
            dueDate,
        };

        setTasks([...tasks, newTask]);
        saveTasks([...tasks, newTask]);
    }

    function deleteTask(index) {
        var clonedTasks = [...tasks];
        clonedTasks.splice(index, 1);
        setTasks(clonedTasks);
        saveTasks([...clonedTasks]);
    }

    function loadTasks() {
        let loadedTasks = localStorage.getItem('tasks');
        let tasks = JSON.parse(loadedTasks);
        if (tasks) {
            setTasks(tasks);
        }
    }

    function saveTasks(tasks) {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    useEffect(() => {
        loadTasks();
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            const now = new Date();
            tasks.forEach((task, index) => {
                const dueDate = new Date(task.dueDate);
                if (dueDate <= now) {
                    sendReminder(task.title);
                    deleteTask(index);
                }
            });
        }, 60000); // Check for reminders every minute

        return () => clearInterval(interval);
    }, [tasks]);

    function sendReminder(taskTitle) {
        setNotification({
            title: 'Reminder',
            message: `Your task "${taskTitle}" is due soon!`,
            color: 'blue',
            autoClose: 5000, // Close the notification after 5 seconds
        });
    }

    return (
        <ColorSchemeProvider
            colorScheme={colorScheme}
            toggleColorScheme={toggleColorScheme}>
            <MantineProvider
                theme={{ colorScheme, defaultRadius: 'md' }}
                withGlobalStyles
                withNormalizeCSS>
                <div className='App'>
                    <Modal
                        opened={opened}
                        size={'md'}
                        title={'New Task'}
                        withCloseButton={false}
                        onClose={() => {
                            setOpened(false);
                        }}
                        centered>
                        <TextInput
                            mt={'md'}
                            ref={taskTitle}
                            placeholder={'Task Title'}
                            required
                            label={'Title'}
                        />
                        <TextInput
                            ref={taskSummary}
                            mt={'md'}
                            placeholder={'Task Summary'}
                            label={'Summary'}
                        />
                        <Group mt={'md'} position={'apart'}>
                            <Button
                                onClick={() => {
                                    setOpened(false);
                                }}
                                variant={'subtle'}>
                                Cancel
                            </Button>
                            <Button
                                onClick={() => {
                                    createTask();
                                    setOpened(false);
                                }}>
                                Create Task
                            </Button>
                        </Group>
                    </Modal>
                    <Container size={550} my={40}>
                        <Group position={'apart'}>
                            <Title
                                sx={(theme) => ({
                                    fontFamily: `Greycliff CF, ${theme.fontFamily}`,
                                    fontWeight: 900,
                                })}>
                                My Tasks
                            </Title>
                            <ActionIcon
                                color={'blue'}
                                onClick={() => toggleColorScheme()}
                                size='lg'>
                                {colorScheme === 'dark' ? (
                                    <Sun size={16} />
                                ) : (
                                    <MoonStars size={16} />
                                )}
                            </ActionIcon>
                        </Group>
                        {tasks.length > 0 ? (
                            tasks.map((task, index) => {
                                if (task.title) {
                                    return (
                                        <Card withBorder key={index} mt={'sm'}>
                                            <Group position={'apart'}>
                                                <Text weight={'bold'}>
                                                    {task.title}
                                                </Text>
                                                <ActionIcon
                                                    onClick={() => {
                                                        deleteTask(index);
                                                    }}
                                                    color={'red'}
                                                    variant={'transparent'}>
                                                    <Trash />
                                                </ActionIcon>
                                            </Group>
                                            <Text color={'dimmed'} size={'md'} mt={'sm'}>
                                                {task.summary
                                                    ? task.summary
                                                    : 'No summary was provided for this task'}
                                            </Text>
                                        </Card>
                                    );
                                }
                            })
                        ) : (
                            <Text size={'lg'} mt={'md'} color={'dimmed'}>
                                You have no tasks
                            </Text>
                        )}
                        <Button
                            onClick={() => {
                                setOpened(true);
                            }}
                            fullWidth
                            mt={'md'}>
                            New Task
                        </Button>
                    </Container>
                </div>
                {notification && (
                    <Notification
                        title={notification.title}
                        onClose={() => setNotification(null)}
                        {...notification}
                    />
                )}
            </MantineProvider>
        </ColorSchemeProvider>
    );
}
