/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/taskvault.json`.
 */
export type Taskvault = {
  "address": "G2mbnQ1yqvt6XJxt7YPXPDLLRfWm798Kxxbk8mHtmzdR",
  "metadata": {
    "name": "taskvault",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "approveWork",
      "docs": [
        "Approve submitted work and release escrowed SOL to worker"
      ],
      "discriminator": [
        181,
        118,
        45,
        143,
        204,
        88,
        237,
        109
      ],
      "accounts": [
        {
          "name": "creator",
          "writable": true,
          "signer": true,
          "relations": [
            "task"
          ]
        },
        {
          "name": "worker",
          "writable": true
        },
        {
          "name": "task",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  116,
                  97,
                  115,
                  107
                ]
              },
              {
                "kind": "account",
                "path": "creator"
              },
              {
                "kind": "account",
                "path": "task.taskId",
                "account": "task"
              }
            ]
          },
          "relations": [
            "escrow"
          ]
        },
        {
          "name": "escrow",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  101,
                  115,
                  99,
                  114,
                  111,
                  119
                ]
              },
              {
                "kind": "account",
                "path": "task"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "cancelTask",
      "docs": [
        "Cancel an unfulfilled task and refund creator"
      ],
      "discriminator": [
        69,
        228,
        134,
        187,
        134,
        105,
        238,
        48
      ],
      "accounts": [
        {
          "name": "creator",
          "writable": true,
          "signer": true,
          "relations": [
            "task"
          ]
        },
        {
          "name": "task",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  116,
                  97,
                  115,
                  107
                ]
              },
              {
                "kind": "account",
                "path": "creator"
              },
              {
                "kind": "account",
                "path": "task.taskId",
                "account": "task"
              }
            ]
          },
          "relations": [
            "escrow"
          ]
        },
        {
          "name": "escrow",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  101,
                  115,
                  99,
                  114,
                  111,
                  119
                ]
              },
              {
                "kind": "account",
                "path": "task"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "claimTask",
      "docs": [
        "Claim an open task bounty as a contributor"
      ],
      "discriminator": [
        49,
        222,
        219,
        238,
        155,
        68,
        221,
        136
      ],
      "accounts": [
        {
          "name": "worker",
          "writable": true,
          "signer": true
        },
        {
          "name": "task",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  116,
                  97,
                  115,
                  107
                ]
              },
              {
                "kind": "account",
                "path": "task.creator",
                "account": "task"
              },
              {
                "kind": "account",
                "path": "task.taskId",
                "account": "task"
              }
            ]
          }
        }
      ],
      "args": []
    },
    {
      "name": "createTask",
      "docs": [
        "Create a new task bounty"
      ],
      "discriminator": [
        194,
        80,
        6,
        180,
        232,
        127,
        48,
        171
      ],
      "accounts": [
        {
          "name": "creator",
          "writable": true,
          "signer": true
        },
        {
          "name": "task",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  116,
                  97,
                  115,
                  107
                ]
              },
              {
                "kind": "account",
                "path": "creator"
              },
              {
                "kind": "arg",
                "path": "taskId"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "taskId",
          "type": "u64"
        },
        {
          "name": "rewardLamports",
          "type": "u64"
        },
        {
          "name": "deadline",
          "type": "i64"
        },
        {
          "name": "category",
          "type": "u8"
        },
        {
          "name": "title",
          "type": "string"
        },
        {
          "name": "specHash",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        }
      ]
    },
    {
      "name": "fundTask",
      "docs": [
        "Deposit SOL reward into program escrow PDA"
      ],
      "discriminator": [
        188,
        87,
        71,
        120,
        11,
        238,
        84,
        232
      ],
      "accounts": [
        {
          "name": "creator",
          "writable": true,
          "signer": true,
          "relations": [
            "task"
          ]
        },
        {
          "name": "task",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  116,
                  97,
                  115,
                  107
                ]
              },
              {
                "kind": "account",
                "path": "creator"
              },
              {
                "kind": "account",
                "path": "task.taskId",
                "account": "task"
              }
            ]
          }
        },
        {
          "name": "escrow",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  101,
                  115,
                  99,
                  114,
                  111,
                  119
                ]
              },
              {
                "kind": "account",
                "path": "task"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "submitWork",
      "docs": [
        "Submit deliverable work (PR / IPFS / demo) for creator review"
      ],
      "discriminator": [
        158,
        80,
        101,
        51,
        114,
        130,
        101,
        253
      ],
      "accounts": [
        {
          "name": "worker",
          "writable": true,
          "signer": true
        },
        {
          "name": "task",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  116,
                  97,
                  115,
                  107
                ]
              },
              {
                "kind": "account",
                "path": "task.creator",
                "account": "task"
              },
              {
                "kind": "account",
                "path": "task.taskId",
                "account": "task"
              }
            ]
          }
        }
      ],
      "args": [
        {
          "name": "submissionData",
          "type": "string"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "escrow",
      "discriminator": [
        31,
        213,
        123,
        187,
        186,
        22,
        218,
        155
      ]
    },
    {
      "name": "task",
      "discriminator": [
        79,
        34,
        229,
        55,
        88,
        90,
        55,
        84
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "unauthorizedCreator",
      "msg": "Only the creator of the task can perform this action"
    },
    {
      "code": 6001,
      "name": "unauthorizedWorker",
      "msg": "Only the assigned worker can perform this action"
    },
    {
      "code": 6002,
      "name": "invalidTaskStatus",
      "msg": "Task is not in the correct status for this action"
    },
    {
      "code": 6003,
      "name": "deadlinePassed",
      "msg": "Task deadline has passed"
    },
    {
      "code": 6004,
      "name": "invalidDeadline",
      "msg": "Task deadline must be in the future"
    },
    {
      "code": 6005,
      "name": "invalidRewardAmount",
      "msg": "Reward amount must be greater than zero"
    },
    {
      "code": 6006,
      "name": "titleTooLong",
      "msg": "Task title exceeds maximum allowed length"
    },
    {
      "code": 6007,
      "name": "submissionTooLong",
      "msg": "Submission details exceed maximum allowed length"
    },
    {
      "code": 6008,
      "name": "creatorCannotClaim",
      "msg": "Creator cannot claim their own task"
    },
    {
      "code": 6009,
      "name": "insufficientEscrowBalance",
      "msg": "The escrow balance is insufficient for this payout"
    },
    {
      "code": 6010,
      "name": "arithmeticOverflow",
      "msg": "Lamport arithmetic overflow"
    }
  ],
  "types": [
    {
      "name": "escrow",
      "docs": [
        "Program-owned SOL escrow for one task. Its PDA can only be debited by this program."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "task",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "task",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "creator",
            "docs": [
              "Creator of the bounty task"
            ],
            "type": "pubkey"
          },
          {
            "name": "worker",
            "docs": [
              "Assigned worker / contributor"
            ],
            "type": {
              "option": "pubkey"
            }
          },
          {
            "name": "rewardLamports",
            "docs": [
              "Reward in lamports held in escrow"
            ],
            "type": "u64"
          },
          {
            "name": "taskId",
            "docs": [
              "Unique numeric identifier for the creator's task"
            ],
            "type": "u64"
          },
          {
            "name": "deadline",
            "docs": [
              "Unix timestamp deadline"
            ],
            "type": "i64"
          },
          {
            "name": "status",
            "docs": [
              "Current lifecycle status"
            ],
            "type": {
              "defined": {
                "name": "taskStatus"
              }
            }
          },
          {
            "name": "category",
            "docs": [
              "Category ID or identifier (e.g. dev, design, audit)"
            ],
            "type": "u8"
          },
          {
            "name": "title",
            "docs": [
              "Brief title (up to 80 chars)"
            ],
            "type": "string"
          },
          {
            "name": "specHash",
            "docs": [
              "SHA-256 hash or identifier of detailed description / specification"
            ],
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "submissionData",
            "docs": [
              "Deliverable proof URL, PR, or IPFS CID (up to 256 chars)"
            ],
            "type": "string"
          },
          {
            "name": "submittedAt",
            "docs": [
              "Timestamp when work was submitted"
            ],
            "type": "i64"
          },
          {
            "name": "completedAt",
            "docs": [
              "Timestamp when task was completed/approved"
            ],
            "type": "i64"
          },
          {
            "name": "bump",
            "docs": [
              "PDA bump"
            ],
            "type": "u8"
          },
          {
            "name": "escrowBump",
            "docs": [
              "Escrow PDA bump"
            ],
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "taskStatus",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "created"
          },
          {
            "name": "funded"
          },
          {
            "name": "claimed"
          },
          {
            "name": "submitted"
          },
          {
            "name": "approved"
          },
          {
            "name": "cancelled"
          }
        ]
      }
    }
  ],
  "constants": [
    {
      "name": "escrowSeed",
      "type": "bytes",
      "value": "[101, 115, 99, 114, 111, 119]"
    },
    {
      "name": "taskSeed",
      "type": "bytes",
      "value": "[116, 97, 115, 107]"
    }
  ]
};
