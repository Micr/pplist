"use strict"
var body,
    alert,
    alertButton,
    templateContainer,
    groupContainer,
    personDialog,
    personDialogName,
    personDialogAdd,
    personDialogCancel,
    groupTemplate,
    personTemplate,
    groupSelectList,
    groupDisplaySelected,
    groupDisplaySelectedText,
    groupSelectContainer;
var displayNone = 'display_none';
//var dialogViewModel = {};
var presenter, groupModel, groupCollection;
var alertWindowManager;
var lastGroupId = 0;
var groupLabel = 'Group №';
document.addEventListener('DOMContentLoaded', function () {

  body = document.body;
  alert = document.getElementById('alert');
  alertButton = document.getElementById('alert_button');
  alertWindowManager = new AlertWindowManager(alert);
  groupContainer = document.getElementById('group_container');
  personDialog = document.getElementById('person_dialog');
  personDialogName = document.getElementById('person_dialog_name');
  personDialogAdd = document.getElementById('person_dialog_ok');
  personDialogCancel = document.getElementById('person_dialog_cancel');
  templateContainer = document.getElementById('template_container');
  personTemplate = templateContainer.getElementsByClassName('person_view')[0];
  groupTemplate = templateContainer.getElementsByClassName('group_view')[0];
  groupDisplaySelected = document.getElementById('person_dialog_group_current');
  groupDisplaySelectedText = document.getElementById('person_dialog_group_current_text');
  groupSelectContainer = document.getElementById('person_dialog_group_select_container');
  groupSelectList = document.getElementById('person_dialog_group_select_list');

  presenter.addGroup();

  document.getElementById('group_button').addEventListener('click', function () {
    presenter.addGroup();
  });

  document.getElementById('person_button').addEventListener('click', function () {
    event.stopPropagation();
    showPersonDialog();
  });

  document.addEventListener('keydown', function () {
    if (event.keyCode == 13 && !personDialog.classList.contains('display_none'))
    {
      presenter.addPerson();
    } else if (event.keyCode == 27 && !personDialog.classList.contains('display_none')) {
      personDialog.classList.add('display_none');
    }
  });

  personDialogAdd.addEventListener('click', function () {
    event.stopPropagation();
    presenter.addPerson();
  });

  personDialogCancel.addEventListener('click', function () {
    personDialog.classList.add('display_none');
  });

  groupContainer.addEventListener('click', function (event) {
    var target = $(event.target);
    var removeButton = target.closest('.person_remove').length;
    if (removeButton) {
      presenter.removePerson(target.closest('.person_view')[0]);
      return;
    }
    removeButton = target.closest('.group_remove').length;
    if (removeButton) {
      presenter.removeGroup(target.closest('.group_view')[0]);
    }
  });

  groupDisplaySelected.addEventListener('click', function (event) {
    event.stopPropagation();
    presenter.showGroupSelectList();
  });

  groupSelectList.addEventListener('click', function (event) {
    var parent = $(event.target).closest('.person_dialog_group_option')[0];
    presenter.activateGroupOption(parent);
  });

  alertButton.addEventListener('click', function (event) {
    event.stopPropagation();
    alertWindowManager.hideWindow();
  });

});

function personDialogClickClose (event) {
  if (!personDialog.contains(event.target)) {
    self.hidePersonDialog();
  }
}

function personDialogEscClose () {
  if (event.keyCode === 27) {
    self.hidePersonDialog();
  }
}

function personDialogOn () {
  document.addEventListener('click', personDialogClickClose);
  document.addEventListener('keydown', personDialogEscClose);
}

function personDialogOff () {
  document.removeEventListener('click', personDialogClickClose);
  document.removeEventListener('keydown', personDialogEscClose);
}

function showPersonDialog () {
  if (!personDialog.classList.contains(displayNone)) {
    return;
  }
  if (!groupCollection.getGroupCount()) {
    alertWindowManager.setAlertText('Add a group first!')
    alertWindowManager.showWindow();
    return;
  }
  personDialog.classList.remove(displayNone);
  personDialogName.focus();
  personDialogOn();
}

function hidePersonDialog () {
    personDialog.classList.add(displayNone);
    personDialogOff();
}

function WindowManager (window) {

  var self = this;

  function windowClickClose (event) {
    if (!window.contains(event.target)) {
      self.hideWindow();
    }
  }

  function windowEscClose (event) {
    if (event.keyCode === 27) {
      self.hideWindow();
    }
  }

  function windowOn () {
    document.addEventListener('click', windowClickClose);
    document.addEventListener('keydown', windowEscClose);
  }

  function windowOff () {
    document.removeEventListener('click', windowClickClose);
    document.removeEventListener('keydown', windowEscClose);
  }

  self = {
    showWindow: function () {
      window.classList.remove(displayNone);
      windowOn();
    },
    hideWindow: function () {
      window.classList.add(displayNone);
      windowOff();
    }
  };

  return self;
}

function AlertWindowManager (alert) {

  var parent = new WindowManager(alert);

  var self = {};

  $.extend(self, parent);

  var ownMethods = {
    setAlertText: function (text) {
      document.getElementById('alert_text').textContent = text;
    }
  };

  $.extend(self, ownMethods);

  return self;
}

function Presenter () {

  var groupSelectViewModels = [];

  var groupPresenters = [];

  function groupSelectClickClose (event) {
    if (!groupSelectList.contains(event.target)) {
      self.hideGroupSelectList();
    }
  }

  function groupSelectEscClose (event) {
    if (event.keyCode === 27) {
      self.hideGroupSelectList();
    }
  }

  function groupSelectListOn () {
    document.addEventListener('click', groupSelectClickClose);
    document.addEventListener('keydown', groupSelectEscClose);
  }

  function groupSelectListOff () {
    document.removeEventListener('click', groupSelectClickClose);
    document.removeEventListener('keydown', groupSelectEscClose);
  }

  function createGroupView (groupId) {
    var newGroupView = groupTemplate.cloneNode(true);
    newGroupView.getElementsByClassName('group_title')[0]
      .textContent = groupLabel + groupId;
    return newGroupView;
  }

  function addGroupPresenter (model, view) {
    // TODO move GroupPresenter instantiation out
    groupPresenters.push(new GroupPresenter(model, view));
  }

  function createGroupOption (groupId) {
      var newItem = document.createElement('li');
      newItem.className = 'person_dialog_group_option';
      // TODO change this check to something more effective or move out
      if (!groupSelectList.children.length) {
        newItem.classList.add('selected');
        groupDisplaySelectedText.textContent = groupId;
        groupDisplaySelectedText.setAttribute('title', groupId);
        groupSelectContainer.classList.remove(displayNone);
      }
      newItem.textContent = groupId;
      return newItem;
  }

  var self = {
    getNewGroupId: function () {
      lastGroupId++;
      return lastGroupId;
    },
    addGroup: function () {
      // TODO possibly model domain code
      var groupId = self.getNewGroupId();
      var newGroupView = createGroupView(groupId);
      addGroupPresenter(groupCollection.addGroup(groupId), newGroupView);
      groupContainer.appendChild(newGroupView);
      // TODO viewModel holds model domain data
      self.addToGroupSelect(groupId);
    },
    addToGroupSelect: function (groupId) {
      var newItem = createGroupOption(groupId);
      groupSelectViewModels.push({ id: groupId, element: newItem });
      groupSelectList.appendChild(newItem);
    },
    removeGroup: function (element) {
      groupPresenters.some(function (presenter, index) {
        if (presenter.view === element) {
          self.removeFromGroupSelect(presenter.model.id);
          groupCollection.removeGroup(presenter.model);
          groupPresenters.splice(index, 1);
          groupContainer.removeChild(element);
          return true;
        }
      });
    },
    removeFromGroupSelect: function (id) {
      groupSelectViewModels.some(function (viewModel, index) {
        if (viewModel.id === id) {
          groupSelectList.removeChild(viewModel.element);
          groupSelectViewModels.splice(index, 1);
          // TODO do not show person dialog if there is no groups
          if (!groupSelectViewModels.length) {
            groupSelectContainer.classList.add(displayNone);
          } else if (viewModel.element.classList.contains('selected')) {
            self.setGroupDisplayState(groupSelectList.children[0]);
          }
          return true;
        }
      });
    },
    activateGroupOption: function (element) {
      var selected = groupSelectList.getElementsByClassName('selected')[0]
        .classList.remove('selected');
      self.setGroupDisplayState(element);
      self.hideGroupSelectList();
    },
    setGroupDisplayState: function (element) {
      element.classList.add('selected');
      groupDisplaySelectedText.textContent = element.textContent;
        groupDisplaySelectedText.setAttribute('title', element.textContent);
      //dialogViewModel.group = element.textContent;
    },
    showGroupSelectList: function () {
      if (groupSelectList.classList.contains('display_none')) {
        groupSelectList.classList.remove('display_none');
        groupSelectListOn();
      } else {
        self.hideGroupSelectList();
      }
    },
    hideGroupSelectList: function () {
      groupSelectList.classList.add('display_none');
      groupSelectListOff();
    },
    addPerson: function () {

      var personData = personDialogName.value;
      if (!personData) {
        alertWindowManager.setAlertText('Please supply a name for the person');
        alertWindowManager.showWindow();
        return;
      }
      var selectedGroupElement = groupSelectList.getElementsByClassName('selected')[0];

      groupSelectViewModels.some(function (model) {
        if (model.element === selectedGroupElement) {
          groupPresenters.some(function (presenter) {
            if (presenter.model.id === model.id) {
              var personPresenter = presenter.createPersonPresenter(personData)
              presenter.view.appendChild(personPresenter.view);
              return true;
            }
          });
          return true;
        }
      });
    },
    removePerson: function (element) {
      var groupView = $(element).closest('.group_view')[0];
      groupPresenters.some(function (presenter) {
        if (presenter.view === groupView) {
          presenter.removePersonPresenter(element);
          return true;
        }
      });
    }
  };

  return self;

}

// Holds group models
function GroupCollection () {

  var groupModels = [];

  return {
    addGroup: function (id) {
      var model = new GroupModel(id);
      groupModels.push(model);
      return model;
    },
    removeGroup: function (model) {
      groupModels.some(function (groupModel, index) {
        if (groupModel === model) {
          groupModels.splice(index, 1);
          return true;
        }
      });
    },
    getGroupCount: function () {
      return groupModels.length;
    }
  }
}

function GroupModel (id) {
  var persons = [];
  return {
    id: id,
    addPerson: function (id) {
      persons.push(id)
    },
    removePerson: function (id) {
      persons.some(function (person, index) {
        if (person === id) {
          persons.splice(index, 1);
          return true;
        }
      });
    }
  };
}

function GroupPresenter (model, view) {
  var personId = 0;
  var self = this;
  this.model = model;
  this.view = view;
  var personPresenters = [];

  function createPersonView (personData) {
    var viewElement = personTemplate.cloneNode(true);
    var personName = viewElement.getElementsByClassName('person_name')[0];
    personName.textContent = personData;
    personName.setAttribute('title', personData);
    return viewElement;
  };

  this.createPersonPresenter = function (personData) {
    personId = personId + 1;
    self.model.addPerson(personId);

    var viewElement = createPersonView(personData);
    var personPresenter = {
      id: personId,
      view: viewElement
    };
    personPresenters.push(personPresenter);
    return personPresenter;
  }

  this.removePersonPresenter = function (element) {
    personPresenters.some(function (presenter, index) {
      if (presenter.view === element) {
        self.model.removePerson(presenter.id);
        personPresenters.splice(index, 1);
        self.view.removeChild(element);
        return true;
      }
    });
  }
}

presenter = new Presenter();
groupCollection = new GroupCollection();
