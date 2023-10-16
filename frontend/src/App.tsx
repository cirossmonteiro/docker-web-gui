import { Button, Col, Form, Input, Modal, Row, Table } from "antd";
import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { BsFillTrash3Fill } from 'react-icons/bs';


interface IContainer {
  Args: string[];
  Config: {
    Env: string[];
  };
  Id: string;
}

const App = () => {
  const [image, setImage] = useState<string>("postgres");
  const [open, setOpen] = useState<boolean>(false);
  const [containers, setContainers] = useState<IContainer[]>([]);
  const [env, setEnv] = useState<{ name: string, value: string }[]>([
    { name: "POSTGRES_USER", value: "admin" },
    { name: "POSTGRES_PASSWORD", value: "admin1234" },
    { name: "POSTGRES_DB", value: "main" }
  ]);

  const getContainers = useCallback(async () => {
    const response = await axios.get("http://localhost:8000/containers");
    setContainers(response.data);
  }, []);

  const handleRemoveContainer = useCallback((id: string) => async () => {
    await axios.post(`http://localhost:8000/containers/${id}`);
    getContainers();
  }, []);

  const handleNewContainer = useCallback(async () => {
    // const env = {
    //   "POSTGRES_USER": "admin",
    //   "POSTGRES_PASSWORD": "admin1234",
    //   "POSTGRES_DB": "main"
    // }
    const processedEnv: any = {};
    env.forEach(({ name, value }) => {
      processedEnv[name] = value;
    })
    await axios.post(`http://localhost:8000/containers/`, { image, env: processedEnv });
    setOpen(false);
    getContainers();
  }, [image, env]);

  useEffect(() => {
    getContainers();
  }, []);

  const handleChange = useCallback((fieldName: "name" | "value", index: number) => (e: any) => {
    setEnv(current => {
      current[index][fieldName] = e.target.value;
      return [ ...current ];
    });
  }, []);

  const handleNewField = useCallback(() => {
    setEnv(current => {
      return [
        ...current,
        { name: "", value: "" }
      ];
    });
  }, []);

  const handleEnvDelete = useCallback((index: number) => () => {
    setEnv(current => current.filter((_, ind) => ind !== index));
  }, []);

  return (
    <div className="h-100 p-5 d-flex flex-column">
      <div className="mb-5">
        <Button onClick={() => setOpen(true)}>new container</Button>
      </div>

      <Modal open={open}
        title="New container - environment variables"
        onOk={handleNewContainer}
        onCancel={() => setOpen(false)}
      >

        <Form>
          <Row gutter={4}>
            <Col span={12}>Variable's name</Col>
            <Col span={12}>Variable's value</Col>
          </Row>
          {env.map((field, index) => {
            return (
              <Row gutter={4} key={index}>
                <Col span={10}>
                  <Form.Item>
                    <Input value={field.name} onChange={handleChange("name", index)} />
                  </Form.Item>
                </Col>
                <Col span={10}>
                  <Form.Item>
                    <Input value={field.value} onChange={handleChange("value", index)} />
                  </Form.Item>
                </Col>
                <Col span={4}>
                  <BsFillTrash3Fill onClick={handleEnvDelete(index)}/>
                </Col>
              </Row>
            )
          })}
          </Form>
        <Button onClick={handleNewField}>new field</Button>
      </Modal>
      
      <Table dataSource={containers} columns={[
        {
          title: 'id',
          dataIndex: 'Id'
        },
        {
          title: 'image',
          render: (_, container) => container.Args.join(' ')
        },
        {
          title: 'Environment variables',
          render: (_, container) => (
            <div className="d-flex flex-column">
              {container.Config.Env.map(env => (
                <span>{env}</span>
              ))}
            </div>
          )
        },
        {
          title: 'Actions',
          dataIndex: 'Id',
          render: (id) => (
            <>
              <BsFillTrash3Fill onClick={handleRemoveContainer(id)}/>
            </>
          )
        }
      ]} />
    </div>
  );
}

export default App;
