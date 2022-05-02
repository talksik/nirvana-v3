import { Avatar, Modal } from "antd";

import Search from "antd/lib/input/Search";
import { useState } from "react";

export default function NewLineModal({
  open,
  handleClose,
}: {
  open: boolean;
  handleClose: () => void;
}) {
  const handleSubmit = () => {
    // upon success,
    // make sure that the list of lines updates for this client and others so that it shows this new line
    // select the line so that it shows up in the line details for this client

    // handle close once the new line is created
    handleClose();
  };

  const handleCancel = () => {
    handleClose();
  };

  const onSearch = () => {
    console.log("searching for people in database");
  };

  return (
    <>
      <Modal
        title="Create a Line"
        visible={open}
        onCancel={handleCancel}
        footer={
          <div className="flex flex-row text-white">
            <button
              className="flex-1 bg-gray-500 pb-3 pt-2 text-left pl-2"
              onClick={handleCancel}
            >
              Cancel
            </button>
            <button
              className="flex-1 bg-teal-500 pb-3 pt-2 text-left pl-2"
              onClick={handleSubmit}
            >
              Connect
            </button>
          </div>
        }
        className={"gap-5"}
      >
        <div className="flex flex-col items-start">
          <p className="text-gray-300 text-sm">People</p>

          <Search
            placeholder="Search for anyone by name or email."
            allowClear
            enterButton="Search"
            size="large"
            onSearch={onSearch}
          />
        </div>

        {/* search results */}
        <div className="flex flex-col border border-gray-200 shadow-md max-h-[500px]">
          <div className="flex flex-row border-b-100 p-2 items-center">
            <Avatar
              shape="square"
              size="default"
              src={
                "data:image/jpeg;base64,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"
              }
            />

            <div className="flex flex-col items-start">
              <span className="text-lg font-semibold">Jeremy Leon</span>
              <span className="text-gray-400 text-sm">
                jeremyleon@level.com
              </span>
            </div>

            <button className="ml-auto">add</button>
          </div>
        </div>

        {/* selected people */}
        <div className="flex flex-col">
          <p className="text-gray-300 text-sm">People</p>
          <div className="flex flex-row border-b-100 p-2 items-center">
            <Avatar
              shape="square"
              size="default"
              src={
                "data:image/jpeg;base64,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"
              }
            />

            <div className="flex flex-col items-start">
              <span className="text-lg font-semibold">Jeremy Leon</span>
              <span className="text-gray-400 text-sm">
                jeremyleon@level.com
              </span>
            </div>

            <button className="ml-auto">remove</button>
          </div>
        </div>

        <div className="flex flex-col">
          <p className="text-gray-300 text-sm">Line Name (optional)</p>
          <input
            placeholder={"ex. Engineering, Sprint 7, Follow up on present..."}
          />
        </div>
      </Modal>
    </>
  );
}
