import { Modal } from "antd";
import { useState } from "react";

export default function NewLineModal({
  open,
  handleClose,
}: {
  open: boolean;
  handleClose: () => void;
}) {
  const handleOk = () => {
    // upon success,
    // make sure that the list of lines updates for this client and others so that it shows this new line
    // select the line so that it shows up in the line details for this client

    // handle close once the new line is created
    handleClose();
  };

  const handleCancel = () => {
    handleClose();
  };

  return (
    <>
      <Modal
        title="Basic Modal"
        visible={open}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <p>Some contents...</p>
        <p>Some contents...</p>
        <p>Some contents...</p>
      </Modal>
    </>
  );
}
