import { SyntheticEvent, useEffect, useRef, useState } from "react";
import { Todo } from "@shared/types/todo_types";
import Button from "../../components/Common/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheck,
  faFilePen,
  faPen,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import useAutosizeTextArea from "../../components/Common/useAutosizeTextArea";
import {
  createTodoAPI,
  deleteTodoAPI,
  getTodosAPI,
  updateTodoAPI,
} from "../../api/api_todos";
import { getLabelsForTodoAPI } from "../../api/api_labels";
import {
  DateInputNoBorder,
  TextAreaInputNoBorder,
  TextInput,
  TextInputNoBorder,
} from "../../components/Common/TextInput";
import { CollapsibleButton } from "../../components/Common/CollapsibleButton";
import { Label } from "@shared/types/label_types";
import { LabelSelector } from "../../components/Common/LabelSelector";

export default function TodoListComponent() {
  const [completedTodos, setCompletedTodos] = useState<Array<Todo>>([]);
  const [selectedLabels, setSelectedLabels] = useState<Array<Label>>([]);
  const [incompletedTodos, setIncompletedTodos] = useState<Array<Todo>>([]);
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [due_date, setDueDate] = useState<Date | null>(null);
  const [editId, setEditId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState<string>("");
  const [editDescription, setEditDescription] = useState<string>("");
  const [isOpen, setIsOpen] = useState(false);

  const toggleList = () => {
    setIsOpen(!isOpen);
  };

  const editDescriptionAreaRef = useRef<HTMLTextAreaElement>(null);
  useAutosizeTextArea(editDescriptionAreaRef.current, editDescription);

  const editTitleAreaRef = useRef<HTMLTextAreaElement>(null);
  useAutosizeTextArea(editTitleAreaRef.current, editTitle);

  useEffect(() => {
    if (editId !== null) {
      editTitleAreaRef.current?.focus();
    }
  }, [editId]);

  const handleSubmit = (event: SyntheticEvent) => {
    event.preventDefault();
    createTodoAPI(title, description, due_date).then(() => {
      getAllTodos();
    });
    setTitle("");
    setDescription("");
    setDueDate(null);
  };

  useEffect(() => {
    try {
      getAllTodos();
    } catch (err) {
      console.log("error" + err);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function getAllTodos() {
    getTodosAPI().then((todos: Todo[]) => {
      todos.forEach(async (todo) => {
        todo.labels = await getLabelsForTodoAPI(todo.id);
      });
      setCompletedTodos(todos.filter((todo) => todo.completed));
      setIncompletedTodos(todos.filter((todo) => !todo.completed));
    });
  }

  async function deleteTodo(id: number) {
    deleteTodoAPI(id).then(() => {
      getAllTodos();
    });
  }

  async function updateTodo() {
    try {
      if (editId)
        updateTodoAPI(editId, editTitle, editDescription, undefined).then(
          () => {
            setEditId(null);
            getAllTodos();
          }
        );
      else {
        console.log("editId is null");
      }
    } catch (err) {
      console.log("error" + err);
    }
  }

  function getDaysUntilDueDate(dueDate: Date) {
    //TODO add specific time deadline do dates
    const now = new Date();
    const diff = dueDate.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    const hours = Math.ceil(diff / (1000 * 60 * 60));
    const minutes = Math.ceil(diff / (1000 * 60));

    return (
      <div className="flex flex-row">
        <label className="mx-2 break-all text-primary-100 ">
          {days > 0 ? days + " days left" : "overdue"}
          {hours > 0 && hours < 24 && " (" + hours + " hours left)"}
          {minutes > 0 && minutes < 60 && " (" + minutes + " minutes left)"}
        </label>
      </div>
    );
  }

  // Input fields to create a todo and select a label
  function TodoEntryBar() {
    const ref = useRef<HTMLDivElement>(null);

    function focus() {
      ref.current?.classList.add("outline-white");
    }

    function blur() {
      ref.current?.classList.remove("outline-white");
    }

    return (
      <div
        ref={ref}
        className="outline  outline-1 outline-gray-500 rounded-md p-2 mb-2 w-fit focus:outline-white"
      >
        <form className="flex flex-col" onSubmit={handleSubmit}>
          <div className="flex flex-row" onFocus={focus} onBlur={blur}>
            <TextInputNoBorder
              label="Title"
              onChange={setTitle}
              value={title}
              tabIndex={1}
            />

            <DateInputNoBorder
              label="Date"
              onChange={(date) => {
                setDueDate(new Date(date));
              }}
              value={due_date}
              tabIndex={3}
            />
            <Button handleSubmit className="my-1 px-2 py-0">
              Submit
            </Button>
          </div>
          <div
            className="flex flex-row align-baseline mb-4 flex-wrap w-full"
            onFocus={focus}
            onBlur={blur}
          >
            <TextAreaInputNoBorder
              label="Description"
              onChange={setDescription}
              value={description}
              tabIndex={2}
            />
          </div>
        </form>
      </div>
    );
  }

  function todoList(todos: Array<Todo>) {
    return todos
      ?.sort((a: Todo, b: Todo) => a.id - b.id)
      .map((todo: Todo, key: number) => (
        <li className="list-none" key={key}>
          {
            <div
              className={`bg-neutral-800 my-1 py-1 px-2 rounded flex mr-2 ${
                todo.completed && "line-through bg-opacity-70"
              }`}
            >
              <div className="flex flex-col w-full">
                <div className="flex flex-row">
                  {editId === todo.id ? (
                    <textarea
                      className="mr-2 mt-1 text-black border rounded leading-tight focus:outline-none focus:border-primary-500 resize-none w-full overflow-hidden"
                      placeholder="Description to edit"
                      id="editTitle"
                      value={editTitle}
                      ref={editTitleAreaRef}
                      rows={1}
                      onChange={(event) => setEditTitle(event.target.value)}
                    />
                  ) : (
                    <label className="mx-2 break-all break-words sm:text-lg">
                      {todo.title}
                    </label>
                  )}

                  <FontAwesomeIcon
                    icon={faPen}
                    onClick={() => {
                      setEditId(todo.id);
                      setEditTitle(todo.title);
                      setEditDescription(todo.description);
                    }}
                    className="ml-auto m-2  hover:text-primary-500 cursor-pointer"
                  />
                  <FontAwesomeIcon
                    icon={faCheck}
                    onClick={() => {
                      updateTodoAPI(
                        todo.id,
                        undefined,
                        undefined,
                        !todo.completed
                      ).then(() => {
                        getAllTodos();
                      });
                    }}
                    className={`m-2   ${
                      todo.completed
                        ? "hover:text-gray-500 text-green-500"
                        : "hover:text-green-500"
                    } cursor-pointer `}
                  />

                  <FontAwesomeIcon
                    icon={faXmark}
                    onClick={() => deleteTodo(todo.id)}
                    className="m-2 cursor-pointer hover:text-red-500"
                  />
                </div>

                {editId === todo.id ? (
                  <div className="flex flex-col">
                    <textarea
                      className="mb-1 my-1 text-black border rounded leading-tight focus:outline-none focus:border-primary-500 resize-none w-full overflow-hidden"
                      placeholder="Description to edit"
                      id="editDescription"
                      value={editDescription}
                      ref={editDescriptionAreaRef}
                      rows={1}
                      onChange={(event) =>
                        setEditDescription(event.target.value)
                      }
                    />
                    <div className="flex">
                      <Button
                        className="ml-auto mr-2 text-red-500 hover:text-red-700"
                        onClick={() => setEditId(null)}
                      >
                        <div className="flex">
                          <div className="text-white">Cancel</div>
                          <FontAwesomeIcon
                            className="ml-2 my-auto"
                            icon={faXmark}
                          />
                        </div>
                      </Button>
                      <Button
                        onClick={updateTodo}
                        className="text-green-500 hover:text-green-700"
                      >
                        <div className="flex align-middle">
                          <div className="text-white">Update</div>
                          <FontAwesomeIcon
                            className="ml-2 my-auto"
                            icon={faFilePen}
                          />
                        </div>
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col">
                    <label className="mx-2 break-all text-white ">
                      {todo.description}
                    </label>
                    {todo.due_date && (
                      <div className="flex flex-row">
                        <label className="mx-2 break-all text-primary-100 ">
                          {new Date(todo.due_date).toLocaleDateString()}
                        </label>
                        {getDaysUntilDueDate(todo.due_date)}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          }
        </li>
      ));
  }

  return (
    <div className="flex flex-col justify-start text-left h-full text-white">
      {TodoEntryBar()}
      <div className="mt-auto">
        <div>
          {LabelSelector({
            setSelectedLabels: setSelectedLabels,
            selectedLabels: selectedLabels,
          })}
        </div>
      </div>
      <div
        className={`overflow-y-auto overflow-x-hidden scrollbar flex flex-1 flex-col min-w-fit  `}
      >
        {todoList(incompletedTodos)}
        <div className="mt-auto"></div>
        <div>
          <CollapsibleButton
            label="Completed"
            isOpen={isOpen}
            onClick={toggleList}
          />
          {isOpen && todoList(completedTodos)}
        </div>
      </div>
    </div>
  );
}
